const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "erp.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening shared SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database (shared connection)");
  }
});

// Configure WAL mode and busy_timeout to prevent SQLITE_BUSY on concurrent operations
db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL;", (err) => {
    if (err) console.error("Error setting journal_mode to WAL:", err.message);
  });
  db.run("PRAGMA busy_timeout = 5000;", (err) => {
    if (err) console.error("Error setting busy_timeout:", err.message);
  });
});

module.exports = db;
