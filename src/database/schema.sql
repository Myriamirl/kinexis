PRAGMA foreign_keys = ON;

-- 1. TABLE UTILISATEURS (Kinésithérapeutes)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe_hash TEXT NOT NULL,
    rpps TEXT,
    adeli TEXT,
    telephone TEXT,
    signature_path TEXT,
    role TEXT DEFAULT 'kine' CHECK (role IN ('admin', 'kine')),
    est_actif INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cree_par_kine_id INTEGER,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    date_naissance TEXT NOT NULL,
    sexe TEXT CHECK (sexe IN ('M', 'F', 'Autre')),
    taille_cm REAL,
    poids_kg REAL,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    sport_pratique TEXT,
    profil_sportif TEXT CHECK (profil_sportif IN ('Axe', 'Pivot')),
    medecin_prescripteur TEXT,
    medecin_chirurgien TEXT,
    kine_referent_id INTEGER,
    remarques_cliniques TEXT,
    est_archive INTEGER DEFAULT 0 CHECK (est_archive IN (0, 1)),
    date_archivage DATETIME,
    motif_archivage TEXT,
    archive_par_kine_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cree_par_kine_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (kine_referent_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (archive_par_kine_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- 3. TABLE TEMPLATES_BILANS
CREATE TABLE IF NOT EXISTS templates_bilans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    titre TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0',
    structure_json TEXT,
    est_archive INTEGER DEFAULT 0 CHECK (est_archive IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE BILANS
CREATE TABLE IF NOT EXISTS bilans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    kine_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    version_template_utilisee TEXT NOT NULL,
    date_bilan TEXT NOT NULL,
    date_chirurgie TEXT,
    temps_post_op_mois REAL,
    cote_opere TEXT CHECK (cote_opere IN ('Gauche', 'Droit', 'Bilatéral')),
    technique_operatoire TEXT,
    mecanisme_lesionnel TEXT,
    statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'a_analyser', 'termine', 'valide')),
    plan_action_texte TEXT,
    est_archive INTEGER DEFAULT 0 CHECK (est_archive IN (0, 1)),
    date_archivage DATETIME,
    motif_archivage TEXT,
    derniere_modification_par_kine_id INTEGER,
    date_derniere_modification DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (kine_id) REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    FOREIGN KEY (derniere_modification_par_kine_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES templates_bilans(id) ON DELETE RESTRICT
);

-- 5. TABLE RESULTATS_BILAN
CREATE TABLE IF NOT EXISTS resultats_bilan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bilan_id INTEGER NOT NULL,
    categorie TEXT NOT NULL,
    cle_mesure TEXT NOT NULL,
    valeur_num REAL,
    valeur_txt TEXT,
    statut_validation TEXT CHECK (statut_validation IN ('vert', 'orange', 'rouge', 'neutre')),
    FOREIGN KEY (bilan_id) REFERENCES bilans(id) ON DELETE CASCADE
);

-- 6. TABLE PHOTOS_BILAN
CREATE TABLE IF NOT EXISTS photos_bilan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bilan_id INTEGER NOT NULL,
    type_vue TEXT CHECK (type_vue IN ('face_sain', 'face_opere', 'profil_sain', 'profil_opere')),
    chemin_fichier TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bilan_id) REFERENCES bilans(id) ON DELETE CASCADE
);

-- 7. TABLE PARAMETRES_CIBLES
CREATE TABLE IF NOT EXISTS parametres_cibles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_musculaire TEXT NOT NULL UNIQUE,
    cible_3m_n_kg REAL NOT NULL,
    cible_sport_axe_n_kg REAL NOT NULL,
    cible_sport_pivot_n_kg REAL NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLE CONFIGURATION_CABINET
CREATE TABLE IF NOT EXISTS configuration_cabinet (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nom_cabinet TEXT DEFAULT 'CKS Trélazé',
    adresse TEXT DEFAULT '65 rue des Perreyeux, 49800 Trélazé',
    telephone TEXT DEFAULT '07.49.91.43.67',
    email TEXT DEFAULT 'ckstrelaze@gmail.com',
    logo_path TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLE AUDIT_LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kine_id INTEGER,
    action TEXT NOT NULL,
    entite_type TEXT NOT NULL,
    entite_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kine_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- INSERTS INITIALES
INSERT OR IGNORE INTO configuration_cabinet (id, nom_cabinet) VALUES (1, 'CKS Trélazé');

INSERT OR IGNORE INTO parametres_cibles (groupe_musculaire, cible_3m_n_kg, cible_sport_axe_n_kg, cible_sport_pivot_n_kg) VALUES
('Quadriceps', 5.5, 7.5, 8.5),
('Ischio-jambiers', 4.0, 4.5, 5.0),
('Soléaire', 15.0, 18.0, 20.0),
('Moyens fessiers', 5.0, 6.0, 6.0),
('Adducteurs', 5.0, 6.0, 6.0);

INSERT OR IGNORE INTO templates_bilans (code, titre, description, version) VALUES
('POST_LCA_3M', 'Bilan 3 mois POST-LCA', 'Évaluation complète de la mobilité, force isométrique VALD et capacités fonctionnelles post-LCA.', '1.0');