const { ipcMain } = require('electron');
const db = require('../database/db');
const rulesEngine = require('../database/rulesEngine');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { exportBilanToPdf } = require('../services/pdfService');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function registerIpcHandlers() {

    // ==========================================
    // AUTHENTIFICATION & UTILISATEURS (TABLE: utilisateurs)
    // ==========================================

    ipcMain.handle('kines:register', (event, data) => {
        try {
            const { nom, prenom, email, motDePasse, numeroRpps, adeli, telephone } = data;
            
            const existing = db.prepare('SELECT id FROM utilisateurs WHERE email = ?').get(email);
            if (existing) {
                return { success: false, error: "Un compte existe déjà avec cet email." };
            }

            const hash = hashPassword(motDePasse);

            const stmt = db.prepare(`
                INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, rpps, adeli, telephone)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const info = stmt.run(nom, prenom, email, hash, numeroRpps || null, adeli || null, telephone || null);

            const newKine = db.prepare('SELECT id, nom, prenom, email, rpps, adeli, telephone, role FROM utilisateurs WHERE id = ?').get(info.lastInsertRowid);
            return { success: true, kine: newKine };
        } catch (err) {
            console.error("Erreur inscription utilisateur :", err);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('kines:login', (event, { email, motDePasse }) => {
        try {
            const user = db.prepare('SELECT * FROM utilisateurs WHERE email = ? AND est_actif = 1').get(email);
            if (!user) {
                return { success: false, error: "Identifiants incorrects ou compte inactif." };
            }

            const hash = hashPassword(motDePasse);
            if (user.mot_de_passe_hash !== hash) {
                return { success: false, error: "Identifiants incorrects." };
            }

            const sessionKine = {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                rpps: user.rpps,
                adeli: user.adeli,
                telephone: user.telephone,
                role: user.role
            };

            return { success: true, kine: sessionKine };
        } catch (err) {
            console.error("Erreur connexion utilisateur :", err);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('kines:get-all', () => {
        return db.prepare('SELECT id, nom, prenom, email, rpps, telephone FROM utilisateurs WHERE est_actif = 1').all();
    });

    // ==========================================
    // PATIENTS (TABLE: patients)
    // ==========================================

    ipcMain.handle('patients:get-actifs', () => {
        try {
            return db.prepare('SELECT * FROM patients WHERE est_archive = 0 ORDER BY nom ASC').all();
        } catch (err) {
            console.error("Erreur récupération patients :", err);
            return [];
        }
    });

    ipcMain.handle('patients:get-by-id', (event, patientId) => {
        try {
            return db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
        } catch (err) {
            console.error("Erreur récupération patient ID :", err);
            return null;
        }
    });

ipcMain.handle('patients:add', (event, data) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO patients (
                cree_par_kine_id, nom, prenom, date_naissance, sexe, 
                poids_kg, taille_cm, telephone, email, adresse, 
                sport_pratique, profil_sportif, medecin_prescripteur,
                medecin_chirurgien, remarques_cliniques, est_archive
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `);
        const info = stmt.run(
            data.kineId || null, data.nom, data.prenom, data.dateNaissance, data.sexe || 'M',
            data.poidsKg || null, data.tailleCm || null, data.telephone || null, data.email || null,
            data.adresse || null, data.sportPratique || null, data.profilSportif || 'Axe',
            data.medecinPrescripteur || null, data.medecinChirurgien || null, data.remarquesCliniques || null
        );
        return { success: true, patientId: info.lastInsertRowid };
    } catch (err) {
        console.error("Erreur création patient :", err);
        return { success: false, error: err.message };
    }
});

    // ==========================================
    // BILANS & PHOTOS (TABLES: bilans, resultats_bilan, photos_bilan)
    // ==========================================

    ipcMain.handle('bilans:get-recents', () => {
        try {
            return db.prepare(`
                SELECT b.id, b.date_bilan, b.statut, p.nom AS patient_nom, p.prenom AS patient_prenom 
                FROM bilans b
                JOIN patients p ON b.patient_id = p.id
                WHERE b.est_archive = 0
                ORDER BY b.created_at DESC
                LIMIT 5
            `).all();
        } catch (err) {
            console.error("Erreur récupération bilans récents :", err);
            return [];
        }
    });

    ipcMain.handle('bilans:save', async (event, payload) => {
        const { patientId, kineId, dataBilan, photos } = payload;

        try {
            let delaiMois = 0;
            if (dataBilan.dateBilan && dataBilan.dateOperation) {
                const dBilan = new Date(dataBilan.dateBilan);
                const dOp = new Date(dataBilan.dateOperation);
                const diffDays = Math.floor((dBilan - dOp) / (1000 * 60 * 60 * 24));
                delaiMois = parseFloat((diffDays / 30.4375).toFixed(1));
            }

            const stmtBilan = db.prepare(`
                INSERT INTO bilans (
                    patient_id, kine_id, template_id, version_template_utilisee,
                    date_bilan, date_chirurgie, temps_post_op_mois, cote_opere,
                    statut, plan_action_texte
                ) VALUES (?, ?, 1, '1.0', ?, ?, ?, ?, 'termine', ?)
            `);

            const infoBilan = stmtBilan.run(
                patientId,
                kineId,
                dataBilan.dateBilan,
                dataBilan.dateOperation || null,
                delaiMois,
                dataBilan.coteOpere || 'Gauche',
                dataBilan.planAction || ''
            );

            const bilanId = infoBilan.lastInsertRowid;

            const stmtResultat = db.prepare(`
                INSERT INTO resultats_bilan (bilan_id, categorie, cle_mesure, valeur_num, valeur_txt, statut_validation)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            stmtResultat.run(bilanId, 'MOBILITE', 'acl_rsi', parseFloat(dataBilan.aclRsi) || null, null, Number(dataBilan.aclRsi) >= 60 ? 'vert' : 'rouge');
            stmtResultat.run(bilanId, 'MOBILITE', 'ext_gauche', parseFloat(dataBilan.extG) || null, null, Number(dataBilan.extG) === 0 ? 'vert' : 'rouge');
            stmtResultat.run(bilanId, 'MOBILITE', 'ext_droite', parseFloat(dataBilan.extD) || null, null, Number(dataBilan.extD) === 0 ? 'vert' : 'rouge');
            stmtResultat.run(bilanId, 'QUALITE', 'qualite_step_down', null, JSON.stringify(dataBilan.qualiteStepDown || {}), 'neutre');
            stmtResultat.run(bilanId, 'QUALITE', 'qasls_data', null, JSON.stringify(dataBilan.qasls || {}), 'neutre');
            stmtResultat.run(bilanId, 'FORCE_VALD', 'vald_data', null, JSON.stringify(dataBilan.vald || {}), 'neutre');
            stmtResultat.run(bilanId, 'HOP_TESTS', 'hop_tests_data', null, JSON.stringify(dataBilan.hopTests || {}), 'neutre');

            // Sauvegarde des photos (Types de vue alignés sur CHECK SQLITE)
            if (photos && (photos.photoG || photos.photoD)) {
                const uploadDir = path.join(__dirname, '../photos');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                const stmtPhoto = db.prepare(`INSERT INTO photos_bilan (bilan_id, type_vue, chemin_fichier) VALUES (?, ?, ?)`);

                if (photos.photoG) {
                    const fileNameG = `bilan_${bilanId}_face_opere_${Date.now()}.png`;
                    const destPathG = path.join(uploadDir, fileNameG);
                    fs.writeFileSync(destPathG, Buffer.from(photos.photoG.split(',')[1], 'base64'));
                    stmtPhoto.run(bilanId, 'face_opere', destPathG);
                }

                if (photos.photoD) {
                    const fileNameD = `bilan_${bilanId}_face_sain_${Date.now()}.png`;
                    const destPathD = path.join(uploadDir, fileNameD);
                    fs.writeFileSync(destPathD, Buffer.from(photos.photoD.split(',')[1], 'base64'));
                    stmtPhoto.run(bilanId, 'face_sain', destPathD);
                }
            }

            return { success: true, bilanId };
        } catch (err) {
            console.error("Erreur enregistrement bilan :", err);
            return { success: false, error: err.message };
        }
    });

    // ==========================================
    // PARAMÈTRES & CONFIGURATION
    // ==========================================

    ipcMain.handle('settings:save', (event, { cabinetInfo }) => {
        try {
            const stmtCabinet = db.prepare(`
                UPDATE configuration_cabinet 
                SET nom_cabinet = ?, adresse = ?, telephone = ?, email = ?
                WHERE id = 1
            `);
            stmtCabinet.run(cabinetInfo.nom, cabinetInfo.adresse, cabinetInfo.telephone, cabinetInfo.email);
            return { success: true };
        } catch (err) {
            console.error("Erreur sauvegarde paramètres :", err);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('rules:calculer-texte', (event, dataBilan, patient, cibles) => {
        try {
            return rulesEngine.genererDirectives(dataBilan, patient, cibles);
        } catch (err) {
            return "Erreur lors de la génération automatique du plan d'action.";
        }
    });

    ipcMain.handle('pdf:generate', async (event, payload) => {
        try {
            const cabinet = db.prepare('SELECT * FROM configuration_cabinet WHERE id = 1').get();
            return await exportBilanToPdf(payload, cabinet);
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

}

module.exports = { registerIpcHandlers };