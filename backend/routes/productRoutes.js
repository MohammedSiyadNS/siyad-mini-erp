const express = require("express");
const router = express.Router();

const db = require("../sqliteDb");

// CREATE TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    stock INTEGER,
    expiry_date TEXT,
    synced INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    server_timestamp TEXT
  )
`);

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM products WHERE deleted = 0",
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

// ADD PRODUCT
router.post("/", (req, res) => {
  const {
    name,
    price,
    stock,
    expiry_date
  } = req.body;

  const timestamp = new Date().toISOString();

  db.run(
    `
    INSERT INTO products
    (name, price, stock, expiry_date, synced, deleted, server_timestamp)
    VALUES (?, ?, ?, ?, 0, 0, ?)
    `,
    [
      name,
      price,
      stock,
      expiry_date,
      timestamp
    ],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json({
          message: "Product added successfully",
        });
      }
    }
  );
});

// UPDATE PRODUCT
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const {
    name,
    price,
    stock,
    expiry_date
  } = req.body;

  const timestamp = new Date().toISOString();

  db.run(
    `
    UPDATE products
    SET
      name = ?,
      price = ?,
      stock = ?,
      expiry_date = ?,
      synced = 0,
      deleted = 0,
      server_timestamp = ?
    WHERE id = ?
    `,
    [
      name,
      price,
      stock,
      expiry_date,
      timestamp,
      id
    ],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json({
          message: "Product updated successfully",
        });
      }
    }
  );
});

// DELETE PRODUCT
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const timestamp = new Date().toISOString();

  db.run(
    "UPDATE products SET deleted = 1, synced = 0, server_timestamp = ? WHERE id = ?",
    [timestamp, id],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json({
          message: "Product deleted successfully",
        });
      }
    }
  );
});

module.exports = router;