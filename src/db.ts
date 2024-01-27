import Database from "better-sqlite3";
import * as sqlite_vss from "sqlite-vss";
import type { Statement } from 'better-sqlite3'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'

const db = new Database(":memory:");
db.pragma('journal_mode = WAL');

db.prepare(`CREATE TABLE IF NOT EXISTS pages_html (
    createdAt TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    document TEXT
)`).run()


const insertPage: Statement<string[]> = db.prepare(`INSERT INTO pages_html VALUES (CURRENT_TIMESTAMP, ?, ?)`)

const allPages: Statement<string[]>  = db.prepare(`SELECT * from pages_html`)

const getPage: Statement<string[]>  = db.prepare(`SELECT * from pages_html WHERE url = ?`)


console.log(`db sqlite loaded`);




export { insertPage, allPages, getPage }