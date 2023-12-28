import Database from "better-sqlite3";
import * as sqlite_vss from "sqlite-vss";

const db = new Database(":memory:");
sqlite_vss.load(db);

const version = db.prepare("select vss_version()").pluck().get();
console.log(version);