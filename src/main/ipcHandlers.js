const { ipcMain } = require('electron');
const db = require('../database/db');
const rulesEngine = require('../database/rulesEngine');

// =========================================================================
//      PATIENTS (CRUD & Archivage/Réactivation)
// =========================================================================
function registerIpcHandlers() {

    // Obtenir la liste des patients actifs
    ipcMain.handle('patients:get-actifs', () => {
        return db.prepare(`
            SELECT p.*, 
                   (SELECT COUNT(*) FROM bilans b WHERE b.patient_id = p.id AND b.est_archive = 0) AS nb_bilans,
                   (SELECT MAX(date_bilan) FROM bilans b WHERE b.patient_id = p.id AND b.est_archive = 0) AS dernier_bilan
            FROM patients p
            WHERE p.est_archive = 0
            ORDER BY p.nom ASC, p.prenom ASC
        `).all();
    });

    // Obtenir les patients récents (pour l'Accueil)
    ipcMain.handle('patients:get-recents', () => {
        return db.prepare(`
            SELECT id, nom, prenom, date_naissance, 
                   (SELECT MAX(date_bilan) FROM bilans WHERE patient_id = patients.id) AS dernier_bilan
            FROM patients
            WHERE est_archive = 0
            ORDER BY updated_at DESC LIMIT 3
        `).all();
    });

    // Ajouter un patient
    ipcMain.handle('patients:add', (event, p, kineId) => {
        const stmt = db.prepare(`
            INSERT INTO patients (
                cree_par_kine_id, nom, prenom, date_naissance, sexe, taille_cm, poids_kg,
                telephone, email, adresse, sport_pratique, profil_sportif,
                medecin_prescripteur, medecin_chirurgien, kine_referent_id, remarques_cliniques
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            kineId, p.nom, p.prenom, p.date_naissance, p.sexe, p.taille_cm, p.poids_kg,
            p.telephone, p.email, p.adresse, p.sport_pratique, p.profil_sportif,
            p.medecin_prescripteur, p.medecin_chirurgien, p.kine_referent_id, p.remarques_cliniques
        );
    });

    // Archiver / Réactiver un patient
    ipcMain.handle('patients:toggle-archive', (event, patientId, estArchive, kineId, motif) => {
        if (estArchive) {
            return db.prepare(`
                UPDATE patients 
                SET est_archive = 1, date_archivage = CURRENT_TIMESTAMP, motif_archivage = ?, archive_par_kine_id = ?
                WHERE id = ?
            `).run(motif || 'Fin de prise en charge', kineId, patientId);
        } else {
            return db.prepare(`
                UPDATE patients 
                SET est_archive = 0, date_archivage = NULL, motif_archivage = NULL, archive_par_kine_id = NULL
                WHERE id = ?
            `).run(patientId);
        }
    });

    // =========================================================================
    //    BILANS & CALCULS AUTOMATIQUES
    // =========================================================================

    // Obtenir les bilans récents (pour l'Accueil)
    ipcMain.handle('bilans:get-recents', () => {
        return db.prepare(`
            SELECT b.id, b.type_bilan, b.statut, b.date_bilan, p.nom, p.prenom
            FROM bilans b
            JOIN patients p ON b.patient_id = p.id
            WHERE b.est_archive = 0
            ORDER BY b.date_bilan DESC LIMIT 4
        `).all();
    });

    // Exécuter le moteur de règles sur une saisie de bilan
    ipcMain.handle('rules:calculer', (event, donnees, patient) => {
        const lsiQuad = rulesEngine.calculerLSI(donnees.quadriceps_opere_N, donnees.quadriceps_sain_N);
        const forceRel = rulesEngine.calculerForceRelative(donnees.quadriceps_opere_N, patient.poids_kg);
        const planActionText = rulesEngine.genererPlanAction(donnees, patient);

        return {
            lsiQuad,
            forceRel,
            planActionText
        };
    });

    // =========================================================================
    //   PARAMÈTRES & CONFIGURATION
    // =========================================================================

    ipcMain.handle('settings:get-cibles', () => {
        return db.prepare('SELECT * FROM parametres_cibles').all();
    });

    ipcMain.handle('settings:get-cabinet', () => {
        return db.prepare('SELECT * FROM configuration_cabinet WHERE id = 1').get();
    });
}

module.exports = { registerIpcHandlers };