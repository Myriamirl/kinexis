const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const getStoragePath = () => {
    const dir = path.join(__dirname, '../../donnees_locales');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

const dbPath = path.join(getStoragePath(), 'kinexis_database.db');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schemaSql, (err) => {
        if (err) {
            console.error('Erreur initialisation BDD :', err);
        } else {
            console.log('Base de données Kinexis initialisée avec succès.');
        }
    });
}

initDatabase();

module.exports = db;