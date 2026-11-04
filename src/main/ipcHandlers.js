const { ipcMain } = require('electron');
const db = require('../database/db');
const rulesEngine = require('../database/rulesEngine');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { exportBilanToPdf } = require('../services/pdfService');

// --- UTILITAIRES DE HACHAGE DES MOTS DE PASSE (CRYPTO NATIF) ---
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, hash) {
    const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return checkHash === hash;
}

function registerIpcHandlers() {

    // ==========================================
    // AUTHENTIFICATION & COMPTES KINÉS
    // ==========================================

    // Inscription d'un nouveau praticien
    ipcMain.handle('kines:register', (event, data) => {
        try {
            const { nom, prenom, email, motDePasse, numeroRpps, specialite } = data;
            
            const existing = db.prepare('SELECT id FROM kines WHERE email = ?').get(email);
            if (existing) {
                return { success: false, error: "Un compte existe déjà avec cet email." };
            }

            const { salt, hash } = hashPassword(motDePasse);

            const stmt = db.prepare(`
                INSERT INTO kines (nom, prenom, email, mot_de_passe_hash, salt, numero_rpps, specialite)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const info = stmt.run(nom, prenom, email, hash, salt, numeroRpps || '', specialite || 'Kinésithérapeute du Sport');

            const newKine = db.prepare('SELECT id, nom, prenom, email, specialite FROM kines WHERE id = ?').get(info.lastInsertRowid);
            return { success: true, kine: newKine };
        } catch (err) {
            console.error("Erreur inscription kiné :", err);
            return { success: false, error: err.message };
        }
    });

    // Connexion d'un praticien
    ipcMain.handle('kines:login', (event, { email, motDePasse }) => {
        try {
            const kine = db.prepare('SELECT * FROM kines WHERE email = ? AND est_actif = 1').get(email);
            if (!kine) {
                return { success: false, error: "Identifiants incorrects ou compte inactif." };
            }

            const isValid = verifyPassword(motDePasse, kine.salt, kine.mot_de_passe_hash);
            if (!isValid) {
                return { success: false, error: "Identifiants incorrects." };
            }

            const sessionKine = {
                id: kine.id,
                nom: kine.nom,
                prenom: kine.prenom,
                email: kine.email,
                specialite: kine.specialite
            };

            return { success: true, kine: sessionKine };
        } catch (err) {
            console.error("Erreur connexion kiné :", err);
            return { success: false, error: err.message };
        }
    });

    // Liste des praticiens actifs du cabinet
    ipcMain.handle('kines:get-all', () => {
        return db.prepare('SELECT id, nom, prenom, email, specialite FROM kines WHERE est_actif = 1').all();
    });


    // ==========================================
    // GESTION DES PATIENTS
    // ==========================================

    // Récupérer la liste de tous les patients actifs (non archivés)
    ipcMain.handle('patients:get-actifs', () => {
        try {
            return db.prepare('SELECT * FROM patients WHERE est_archive = 0 ORDER BY nom ASC').all();
        } catch (err) {
            console.error("Erreur récupération patients :", err);
            return [];
        }
    });

    // Récupérer un patient spécifique par ID
    ipcMain.handle('patients:get-by-id', (event, patientId) => {
        try {
            return db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
        } catch (err) {
            console.error("Erreur récupération patient ID :", err);
            return null;
        }
    });

    // Créer un nouveau patient
    ipcMain.handle('patients:add', (event, data) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO patients (nom, prenom, date_naissance, sexe, poids_kg, taille_cm, cote_opere, profil_sportif, sport_pratique, niveau_pratique, est_archive)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            `);
            const info = stmt.run(
                data.nom, data.prenom, data.dateNaissance || null, data.sexe || 'M',
                data.poidsKg || null, data.tailleCm || null, data.coteOpere || 'Gauche',
                data.profilSportif || 'Amateur', data.sportPratique || '', data.niveauPratique || ''
            );
            return { success: true, patientId: info.lastInsertRowid };
        } catch (err) {
            console.error("Erreur création patient :", err);
            return { success: false, error: err.message };
        }
    });


    // ==========================================
    // ENREGISTREMENT DU BILAN & PHOTOS
    // ==========================================

    ipcMain.handle('bilans:save', async (event, payload) => {
        const { patientId, kineId, dataBilan, photos } = payload;

        try {
            // Calcul automatique du délai post-opératoire en mois
            let delaiMois = 0;
            if (dataBilan.dateBilan && dataBilan.dateOperation) {
                const dBilan = new Date(dataBilan.dateBilan);
                const dOp = new Date(dataBilan.dateOperation);
                const diffDays = Math.floor((dBilan - dOp) / (1000 * 60 * 60 * 24));
                delaiMois = parseFloat((diffDays / 30.4375).toFixed(1));
            }

            // Insertion de la fiche bilan principale
            const stmtBilan = db.prepare(`
                INSERT INTO bilans (
                    patient_id, kine_id, template_id, version_template_utilisee,
                    date_bilan, date_chirurgie, temps_post_op_mois, cote_opere,
                    statut, plan_action_texte
                ) VALUES (?, ?, 1, '1.0', ?, ?, ?, ?, 'termine', ?)
            `);

            const infoBilan = stmtBilan.run(
                patientId,
                kineId || 1,
                dataBilan.dateBilan,
                dataBilan.dateOperation || null,
                delaiMois,
                dataBilan.coteOpere || 'Gauche',
                dataBilan.planAction || ''
            );

            const bilanId = infoBilan.lastInsertRowid;

            // Stockage des détails de mesures dans resultats_bilan
            const stmtResultat = db.prepare(`
                INSERT INTO resultats_bilan (bilan_id, categorie, cle_mesure, valeur_num, valeur_txt, statut_validation)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            stmtResultat.run(bilanId, 'MOBILITE', 'acl_rsi', parseFloat(dataBilan.aclRsi) || null, null, Number(dataBilan.aclRsi) >= 60 ? 'vert' : 'rouge');
            stmtResultat.run(bilanId, 'MOBILITE', 'ext_gauche', parseFloat(dataBilan.extG) || null, null, Number(dataBilan.extG) === 0 ? 'vert' : 'rouge');
            stmtResultat.run(bilanId, 'MOBILITE', 'ext_droite', parseFloat(dataBilan.extD) || null, null, Number(dataBilan.extD) === 0 ? 'vert' : 'rouge');
            stmtResultat.run(bilanId, 'MOBILITE', 'flex_gauche', parseFloat(dataBilan.flexG) || null, null, 'neutre');
            stmtResultat.run(bilanId, 'MOBILITE', 'flex_droite', parseFloat(dataBilan.flexD) || null, null, 'neutre');
            stmtResultat.run(bilanId, 'QUALITE', 'qualite_step_down', null, JSON.stringify(dataBilan.qualiteStepDown || {}), 'neutre');
            stmtResultat.run(bilanId, 'QUALITE', 'qasls_data', null, JSON.stringify(dataBilan.qasls || {}), 'neutre');
            stmtResultat.run(bilanId, 'FORCE_VALD', 'vald_data', null, JSON.stringify(dataBilan.vald || {}), 'neutre');
            stmtResultat.run(bilanId, 'HOP_TESTS', 'hop_tests_data', null, JSON.stringify(dataBilan.hopTests || {}), 'neutre');
            stmtResultat.run(bilanId, 'SQUAT_QUAL', 'squat_data', null, JSON.stringify(dataBilan.squatQual || {}), 'neutre');
            stmtResultat.run(bilanId, 'CMJ', 'cmj_data', null, JSON.stringify(dataBilan.cmj || {}), 'neutre');

            // Sauvegarde physique des photos locales si présentes
            if (photos && (photos.photoG || photos.photoD)) {
                const uploadDir = path.join(__dirname, '../../donnees_locales/photos');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                const stmtPhoto = db.prepare(`INSERT INTO photos_bilan (bilan_id, type_vue, chemin_fichier) VALUES (?, ?, ?)`);

                if (photos.photoG) {
                    const fileNameG = `bilan_${bilanId}_face_g_${Date.now()}.png`;
                    const destPathG = path.join(uploadDir, fileNameG);
                    fs.writeFileSync(destPathG, Buffer.from(photos.photoG.split(',')[1], 'base64'));
                    stmtPhoto.run(bilanId, 'face_gauche', destPathG);
                }

                if (photos.photoD) {
                    const fileNameD = `bilan_${bilanId}_face_d_${Date.now()}.png`;
                    const destPathD = path.join(uploadDir, fileNameD);
                    fs.writeFileSync(destPathD, Buffer.from(photos.photoD.split(',')[1], 'base64'));
                    stmtPhoto.run(bilanId, 'face_droite', destPathD);
                }
            }

            return { success: true, bilanId };
        } catch (err) {
            console.error("Erreur enregistrement bilan SQLite :", err);
            return { success: false, error: err.message };
        }
    });


    // ==========================================
    // MOTEUR DE RÈGLES & PLAN D'ACTION
    // ==========================================

    ipcMain.handle('rules:calculer-texte', (event, dataBilan, patient, cibles) => {
        try {
            return rulesEngine.genererDirectives(dataBilan, patient, cibles);
        } catch (err) {
            console.error("Erreur calcul du plan d'action :", err);
            return "Erreur lors de la génération automatique du plan d'action.";
        }
    });


    // ==========================================
    // GÉNÉRATION EXPORT PDF
    // ==========================================

    ipcMain.handle('pdf:generate', async (event, payload) => {
        try {
            const cabinet = db.prepare('SELECT * FROM configuration_cabinet WHERE id = 1').get();
            return await exportBilanToPdf(payload, cabinet);
        } catch (err) {
            console.error("Erreur génération PDF :", err);
            return { success: false, error: err.message };
        }
    });

}

module.exports = { registerIpcHandlers };