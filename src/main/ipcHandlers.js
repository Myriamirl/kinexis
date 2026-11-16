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

// Exporter / Sauvegarder la base de données SQLite
    ipcMain.handle('db:export', async () => {
        try {
            const { dialog } = require('electron');
            const fs = require('fs');
            const path = require('path');

            const dbPath = path.join(__dirname, '../kinexis_database.db');
            
            const { filePath, canceled } = await dialog.showSaveDialog({
                title: 'Exporter la base de données Kinexis',
                defaultPath: `kinexis_backup_${new Date().toISOString().slice(0, 10)}.db`,
                filters: [{ name: 'Base de données SQLite', extensions: ['db'] }]
            });

            if (canceled || !filePath) return { success: false };

            fs.copyFileSync(dbPath, filePath);
            return { success: true, path: filePath };
        } catch (err) {
            console.error("Erreur export BDD :", err);
            return { success: false, error: err.message };
        }
    });

    // Restaurer une sauvegarde de la base de données SQLite
    ipcMain.handle('db:restore', async () => {
        try {
            const { dialog } = require('electron');
            const fs = require('fs');
            const path = require('path');

            const dbPath = path.join(__dirname, '../kinexis_database.db');

            const { filePaths, canceled } = await dialog.showOpenDialog({
                title: 'Restaurer une sauvegarde Kinexis',
                filters: [{ name: 'Base de données SQLite', extensions: ['db'] }],
                properties: ['openFile']
            });

            if (canceled || filePaths.length === 0) return { success: false };

            const sourcePath = filePaths[0];
            
            // Sécurité : faire une copie de secours avant écrasement
            const backupSecurite = dbPath + '.bak';
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, backupSecurite);
            }

            fs.copyFileSync(sourcePath, dbPath);
            return { success: true };
        } catch (err) {
            console.error("Erreur restauration BDD :", err);
            return { success: false, error: err.message };
        }
    });

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

// Mettre à jour les informations d'un patient existant
    ipcMain.handle('patients:update', (event, patientData) => {
        try {
            db.prepare(`
                UPDATE patients 
                SET nom = ?, prenom = ?, date_naissance = ?, sexe = ?, 
                    poids_kg = ?, taille_cm = ?, telephone = ?, email = ?, 
                    adresse = ?, sport_pratique = ?, profil_sportif = ?, 
                    medecin_prescripteur = ?, medecin_chirurgien = ?, 
                    remarques_cliniques = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(
                patientData.nom, patientData.prenom, patientData.dateNaissance, patientData.sexe,
                patientData.poidsKg, patientData.tailleCm, patientData.telephone, patientData.email,
                patientData.adresse, patientData.sportPratique, patientData.profilSportif,
                patientData.medecinPrescripteur, patientData.medecinChirurgien,
                patientData.remarquesCliniques, patientData.id
            );
            return { success: true };
        } catch (err) {
            console.error("Erreur mise à jour patient :", err);
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

    // Récupérer tous les bilans d'un patient spécifique
    ipcMain.handle('bilans:get-by-patient', (event, patientId) => {
        try {
            return db.prepare(`
                SELECT b.*, u.prenom AS kine_prenom, u.nom AS kine_nom
                FROM bilans b
                LEFT JOIN utilisateurs u ON b.kine_id = u.id
                WHERE b.patient_id = ? AND b.est_archive = 0
                ORDER BY b.date_bilan DESC
            `).all(patientId);
        } catch (err) {
            console.error("Erreur récupération bilans du patient :", err);
            return [];
        }
    });

    // Récupérer les détails complets d'un bilan spécifique
    ipcMain.handle('bilans:get-details', (event, bilanId) => {
        try {
            const bilan = db.prepare(`
                SELECT b.*, p.nom AS patient_nom, p.prenom AS patient_prenom, u.prenom AS kine_prenom, u.nom AS kine_nom
                FROM bilans b
                JOIN patients p ON b.patient_id = p.id
                LEFT JOIN utilisateurs u ON b.kine_id = u.id
                WHERE b.id = ?
            `).get(bilanId);

            if (!bilan) return { success: false, error: "Bilan introuvable" };

            const resultats = db.prepare(`
                SELECT * FROM resultats_bilan WHERE bilan_id = ?
            `).all(bilanId);

            return { success: true, bilan, resultats };
        } catch (err) {
            console.error("Erreur récupération détails bilan :", err);
            return { success: false, error: err.message };
        }
    });

    // ==========================================
    // SYSTÈME D'ARCHIVAGE (PATIENTS & BILANS)
    // ==========================================

    // Récupérer les patients archivés
    ipcMain.handle('patients:get-archives', () => {
        try {
            return db.prepare(`
                SELECT p.*, u.prenom AS archive_par_prenom, u.nom AS archive_par_nom
                FROM patients p
                LEFT JOIN utilisateurs u ON p.archive_par_kine_id = u.id
                WHERE p.est_archive = 1
                ORDER BY p.date_archivage DESC
            `).all();
        } catch (err) {
            console.error("Erreur récupération patients archivés :", err);
            return [];
        }
    });

    // Archiver un patient (et ses bilans associés)
    ipcMain.handle('patients:archive', (event, { patientId, kineId, motif }) => {
        try {
            const archiveTransaction = db.transaction(() => {
                db.prepare(`
                    UPDATE patients 
                    SET est_archive = 1, 
                        date_archivage = CURRENT_TIMESTAMP, 
                        motif_archivage = ?, 
                        archive_par_kine_id = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(motif || 'Fin de prise en charge', kineId || null, patientId);

                db.prepare(`
                    UPDATE bilans 
                    SET est_archive = 1, 
                        date_archivage = CURRENT_TIMESTAMP, 
                        motif_archivage = ?
                    WHERE patient_id = ? AND est_archive = 0
                `).run('Archivage automatique du dossier patient', patientId);
            });

            archiveTransaction();
            return { success: true };
        } catch (err) {
            console.error("Erreur archivage patient :", err);
            return { success: false, error: err.message };
        }
    });

    // Restaurer (désarchiver) un patient
    ipcMain.handle('patients:unarchive', (event, patientId) => {
        try {
            db.prepare(`
                UPDATE patients 
                SET est_archive = 0, 
                    date_archivage = NULL, 
                    motif_archivage = NULL, 
                    archive_par_kine_id = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(patientId);
            return { success: true };
        } catch (err) {
            console.error("Erreur désarchivage patient :", err);
            return { success: false, error: err.message };
        }
    });

    // Archiver un bilan spécifique
    ipcMain.handle('bilans:archive', (event, { bilanId, motif }) => {
        try {
            db.prepare(`
                UPDATE bilans 
                SET est_archive = 1, 
                    date_archivage = CURRENT_TIMESTAMP, 
                    motif_archivage = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(motif || 'Bilan archivé', bilanId);
            return { success: true };
        } catch (err) {
            console.error("Erreur archivage bilan :", err);
            return { success: false, error: err.message };
        }
    });

    // Restaurer (désarchiver) un bilan spécifique
    ipcMain.handle('bilans:unarchive', (event, bilanId) => {
        try {
            db.prepare(`
                UPDATE bilans 
                SET est_archive = 0, 
                    date_archivage = NULL, 
                    motif_archivage = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(bilanId);
            return { success: true };
        } catch (err) {
            console.error("Erreur désarchivage bilan :", err);
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