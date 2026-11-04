const Database = require('better-sqlite3');
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
const db = new Database(dbPath);

function initDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        db.exec(schemaSql);
        console.log('Base de données Kinexis initialisée avec succès.');
    }
}

initDatabase();

module.exports = db;