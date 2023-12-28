import Database from "better-sqlite3";
import * as sqlite_vss from "sqlite-vss";

const db = new Database(":memory:");
db.pragma('journal_mode = WAL');

// sqlite_vss.load(db);

// const version = db.prepare("select vss_version()").pluck().get();
console.log(`db sqlite loaded`);


db.prepare(`CREATE TABLE IF NOT EXISTS pages_html (
    createdAt TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    document TEXT
)`).run()


const insertPage = db.prepare(`INSERT INTO pages_html VALUES (CURRENT_TIMESTAMP, ?, ?)`)

insertPage.run('http://www.google.com', 'hello world')

const allPages = db.prepare(`SELECT * from pages_html`)

const getPage = db.prepare(`SELECT * from pages_html WHERE url = ?`)

export { insertPage, allPages, getPage }