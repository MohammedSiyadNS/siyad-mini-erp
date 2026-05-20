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
    synced INTEGER DEFAULT 0
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
    synced INTEGER DEFAULT 0
  )
`);

// GET SALES
router.get("/", (req, res) => {
  db.all("SELECT * FROM sales", [], (err, rows) => {

    if (err) {
      res.status(500).json({
        error: err.message,
      });
    }

    else {
      res.json(rows);
    }

  });
});

// ADD SALE + REDUCE STOCK
router.post("/", (req, res) => {

  const { customer, product, quantity, total } = req.body;

  // INSERT SALE
  db.run(
    "INSERT INTO sales (customer, product, quantity, total) VALUES (?, ?, ?, ?)",
    [customer, product, quantity, total],

    function (err) {

      if (err) {
        res.status(500).json({
          error: err.message,
        });
      }

      else {

        // REDUCE PRODUCT STOCK
        db.run(
          "UPDATE products SET stock = stock - ? WHERE name = ?",
          [quantity, product],

          function (err) {

            if (err) {
              res.status(500).json({
                error: err.message,
              });
            }

            else {
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
router.post("/return/:id", async (req, res) => {

  const { id } = req.params;

  db.get(
    "SELECT * FROM sales WHERE id = ?",
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

      db.run(
        "UPDATE products SET stock = stock + ?, synced = 0 WHERE name = ?",
        [sale.quantity, sale.product],
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

          db.run(
            `INSERT INTO returns
              (sale_id, customer, product, quantity, total, return_date, synced)
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [
              sale.id,
              sale.customer,
              sale.product,
              sale.quantity,
              sale.total,
              returnDate,
            ],
            function (err) {

              if (err) {
                return res.status(500).json({
                  error: err.message,
                });
              }

              db.run(
                "DELETE FROM sales WHERE id = ?",
                [id],
                async function (err) {

                  if (err) {
                    return res.status(500).json({
                      error: err.message,
                    });
                  }

                  try {
                    await pool.query(
                      "DELETE FROM sales WHERE id = $1",
                      [id]
                    );
                  } catch (error) {
                    console.error(error.message);
                    return res.status(500).json({
                      error: error.message,
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
    "SELECT * FROM returns ORDER BY return_date DESC",
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
router.delete("/:id", async (req, res) => {

  const { id } = req.params;

  try {

    // DELETE SQLITE
    db.run(
      "DELETE FROM sales WHERE id = ?",
      [id]
    );

    // DELETE SUPABASE
    await pool.query(
      "DELETE FROM sales WHERE id = $1",
      [id]
    );

    res.json({
      message: "Sale deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }
});
module.exports = router;