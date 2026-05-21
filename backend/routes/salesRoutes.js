const express = require("express");
const router = express.Router();
const pool = require("../db");

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./erp.db");

// CREATE SALES TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT,
    product TEXT,
    quantity INTEGER,
    total INTEGER,
    sale_date TEXT,
    synced INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    server_timestamp TEXT
  )
`);

// CREATE RETURNS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    customer TEXT,
    product TEXT,
    quantity INTEGER,
    total INTEGER,
    return_date TEXT,
    synced INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    server_timestamp TEXT
  )
`);

// GET SALES
router.get("/", (req, res) => {
  db.all("SELECT * FROM sales WHERE deleted = 0", [], (err, rows) => {
    if (err) {
      res.status(500).json({
        error: err.message,
      });
    } else {
      res.json(rows);
    }
  });
});

// ADD SALE + REDUCE STOCK
router.post("/", (req, res) => {
  const { customer, product, quantity, total } = req.body;
  const timestamp = new Date().toISOString();
  const saleDate = new Date().toISOString();

  // INSERT SALE
  db.run(
    `INSERT INTO sales 
      (customer, product, quantity, total, sale_date, synced, deleted, server_timestamp) 
     VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
    [customer, product, quantity, total, saleDate, timestamp],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        // REDUCE PRODUCT STOCK AND FORCE SYNC (synced=0, server_timestamp updated)
        db.run(
          "UPDATE products SET stock = stock - ?, synced = 0, server_timestamp = ? WHERE name = ?",
          [quantity, timestamp, product],
          function (err) {
            if (err) {
              res.status(500).json({
                error: err.message,
              });
            } else {
              res.json({
                message: "Sale added and stock updated",
              });
            }
          }
        );
      }
    }
  );
});

// RETURN SALE + RESTORE STOCK
router.post("/return/:id", (req, res) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();

  db.get(
    "SELECT * FROM sales WHERE id = ? AND deleted = 0",
    [id],
    (err, sale) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      if (!sale) {
        return res.status(404).json({
          error: "Sale not found",
        });
      }

      const returnDate = new Date().toISOString();

      // RESTORE PRODUCT STOCK AND FORCE SYNC (synced=0, server_timestamp updated)
      db.run(
        "UPDATE products SET stock = stock + ?, synced = 0, server_timestamp = ? WHERE name = ?",
        [sale.quantity, timestamp, sale.product],
        function (err) {
          if (err) {
            return res.status(500).json({
              error: err.message,
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              error: "Associated product not found",
            });
          }

          // INSERT INTO RETURNS
          db.run(
            `INSERT INTO returns
              (sale_id, customer, product, quantity, total, return_date, synced, deleted, server_timestamp)
             VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`,
            [
              sale.id,
              sale.customer,
              sale.product,
              sale.quantity,
              sale.total,
              returnDate,
              timestamp,
            ],
            function (err) {
              if (err) {
                return res.status(500).json({
                  error: err.message,
                });
              }

              // SOFT DELETE SALE
              db.run(
                "UPDATE sales SET deleted = 1, synced = 0, server_timestamp = ? WHERE id = ?",
                [timestamp, id],
                function (err) {
                  if (err) {
                    return res.status(500).json({
                      error: err.message,
                    });
                  }
                  res.json({
                    message: "Sale returned and stock restored",
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// GET RETURNS
router.get("/returns", (req, res) => {
  db.all(
    "SELECT * FROM returns WHERE deleted = 0 ORDER BY return_date DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }
      res.json(rows);
    }
  );
});

// DELETE SALE
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();

  // SOFT DELETE SQLITE (sync will propagate to Supabase)
  db.run(
    "UPDATE sales SET deleted = 1, synced = 0, server_timestamp = ? WHERE id = ?",
    [timestamp, id],
    function (err) {
      if (err) {
        res.status(500).json({
          error: err.message,
        });
      } else {
        res.json({
          message: "Sale deleted successfully",
        });
      }
    }
  );
});

module.exports = router;