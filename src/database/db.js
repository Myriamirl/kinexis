const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../kinexis_database.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let sqlDb = null;

// Sauvegarde automatique du fichier SQLite sur le disque
function saveToDisk() {
    if (!sqlDb) return;
    const data = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
}

// Initialisation asynchrone au démarrage
const readyPromise = initSqlJs().then((SQL) => {
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        sqlDb = new SQL.Database(fileBuffer);
    } else {
        sqlDb = new SQL.Database();
    }

    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        sqlDb.run(schemaSql);
        saveToDisk();
    }

    console.log('✅ Base SQLite Kinexis initialisée avec succès sur :', dbPath);
});

// Wrapper compatible avec la syntaxe db.prepare(...).get() / .all() / .run()
const db = {
    ready: readyPromise,
    exec(sql) {
        sqlDb.run(sql);
        saveToDisk();
    },
    prepare(sql) {
        return {
            get(...params) {
                const stmt = sqlDb.prepare(sql);
                if (params.length > 0) stmt.bind(params);
                const row = stmt.step() ? stmt.getAsObject() : undefined;
                stmt.free();
                return row;
            },
            all(...params) {
                const stmt = sqlDb.prepare(sql);
                if (params.length > 0) stmt.bind(params);
                const rows = [];
                while (stmt.step()) {
                    rows.push(stmt.getAsObject());
                }
                stmt.free();
                return rows;
            },
            run(...params) {
                const stmt = sqlDb.prepare(sql);
                if (params.length > 0) stmt.bind(params);
                stmt.step();
                stmt.free();

                const res = sqlDb.exec("SELECT last_insert_rowid() AS id");
                const lastInsertRowid = res[0]?.values[0]?.[0] || 0;
                saveToDisk();
                return { lastInsertRowid };
            }
        };
    },
    transaction(fn) {
        return (...args) => {
            sqlDb.run("BEGIN TRANSACTION;");
            try {
                const result = fn(...args);
                sqlDb.run("COMMIT;");
                saveToDisk();
                return result;
            } catch (err) {
                sqlDb.run("ROLLBACK;");
                throw err;
            }
        };
    }
};

module.exports = db;