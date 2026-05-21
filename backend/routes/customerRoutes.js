const express = require("express");
const router = express.Router();

const db = require("../sqliteDb");

// CREATE TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    place TEXT,
    synced INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    server_timestamp TEXT
  )
`);

// GET CUSTOMERS
router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM customers WHERE deleted = 0",
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json(rows);
      }
    }
  );
});

// ADD CUSTOMER
router.post("/", (req, res) => {
  const { name, phone, place } = req.body;
  const timestamp = new Date().toISOString();

  db.run(
    `
    INSERT INTO customers
    (name, phone, place, synced, deleted, server_timestamp)
    VALUES (?, ?, ?, 0, 0, ?)
    `,
    [name, phone, place, timestamp],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json({
          message: "Customer added successfully",
        });
      }
    }
  );
});

// UPDATE CUSTOMER
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { name, phone, place } = req.body;
  const timestamp = new Date().toISOString();

  db.run(
    `
    UPDATE customers
    SET
      name = ?,
      phone = ?,
      place = ?,
      synced = 0,
      deleted = 0,
      server_timestamp = ?
    WHERE id = ?
    `,
    [name, phone, place, timestamp, id],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }
      res.json({
        message: "Customer updated successfully",
      });
    }
  );
});

// DELETE CUSTOMER
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();

  db.run(
    "UPDATE customers SET deleted = 1, synced = 0, server_timestamp = ? WHERE id = ?",
    [timestamp, id],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json({
          message: "Customer deleted successfully",
        });
      }
    }
  );
});

module.exports = router;