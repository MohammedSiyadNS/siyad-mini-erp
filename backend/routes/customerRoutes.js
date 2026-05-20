const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./erp.db");

// CREATE TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    place TEXT,
    synced INTEGER DEFAULT 0
  )
`);

// GET CUSTOMERS
router.get("/", (req, res) => {

  db.all(
    "SELECT * FROM customers",
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

  db.run(
    `
    INSERT INTO customers
    (name, phone, place, synced)
    VALUES (?, ?, ?, 0)
    `,
    [name, phone, place],

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

  db.run(
    `
    UPDATE customers
    SET
      name = ?,
      phone = ?,
      place = ?,
      synced = 0
    WHERE id = ?
    `,
    [name, phone, place, id],

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

  db.run(
    "DELETE FROM customers WHERE id = ?",
    [id],

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