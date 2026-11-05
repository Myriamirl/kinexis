const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Création/Connexion à la base SQLite à la racine du projet
const dbPath = path.join(__dirname, '../kinexis_database.db');
const db = new Database(dbPath);

function initDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        db.exec(schemaSql);
        console.log('✅ Base SQLite Kinexis initialisée sur :', dbPath);
    }
}

initDatabase();

module.exports = db;