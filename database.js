const {DatabaseSync} = require("node:sqlite");
const path = require("node:path");

const dbPath = path.join(__dirname,"tasks.db");

const db = new DatabaseSync(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0
    )
`);

module.exports = db;