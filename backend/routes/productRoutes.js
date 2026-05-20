const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const pool = require("../db");

// DATABASE CONNECTION
const db = new sqlite3.Database("./erp.db", (err) => {

  if (err) {

    console.log("Database connection error");

  } else {

    console.log("Connected to SQLite database");

  }

});

// CREATE TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS products (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT,

    price INTEGER,

    stock INTEGER,

    expiry_date TEXT,

    synced INTEGER DEFAULT 0

  )
`);

// GET ALL PRODUCTS
router.get("/", (req, res) => {

  db.all(
    "SELECT * FROM products",
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

  db.run(
    `
    INSERT INTO products
    (name, price, stock, expiry_date, synced)

    VALUES (?, ?, ?, ?, 0)
    `,
    [
      name,
      price,
      stock,
      expiry_date
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

  db.run(
    `
    UPDATE products

    SET
      name = ?,
      price = ?,
      stock = ?,
      expiry_date = ?,
      synced = 0

    WHERE id = ?
    `,
    [
      name,
      price,
      stock,
      expiry_date,
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

  db.run(
    "DELETE FROM products WHERE id = ?",
    [id],

    async function (err) {

      if (err) {

        res.status(500).json({
          error: err.message,
        });

      } else {

        try {
          await pool.query(
            "DELETE FROM products WHERE id = $1",
            [id]
          );

          res.json({
            message: "Product deleted successfully",
          });

        } catch (error) {
          console.error(error.message);
          res.status(500).json({
            error: error.message,
          });
        }

      }

    }
  );

});

module.exports = router;