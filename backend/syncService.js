const sqlite3 = require("sqlite3").verbose();
const pool = require("./db");

const db = new sqlite3.Database("./erp.db");

// Ensure remote Postgres tables have a `synced` column
async function ensureSyncedColumns() {
  const tables = ["products", "sales", "customers", "returns"];

  for (const t of tables) {
    try {
      await pool.query(
        `ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS synced INTEGER DEFAULT 0;`
      );
      console.log(`Ensured synced column on ${t}`);
    } catch (err) {
      // If table doesn't exist in Postgres, create it with a compatible schema
      if (/does not exist|Relation .* does not exist/i.test(err.message)) {
        try {
          let createSQL = "";
          if (t === "products") {
            createSQL = `CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY,
              name TEXT,
              price NUMERIC,
              stock INTEGER,
              expiry_date TEXT,
              synced INTEGER DEFAULT 0
            );`;
          } else if (t === "sales") {
            createSQL = `CREATE TABLE IF NOT EXISTS sales (
              id INTEGER PRIMARY KEY,
              customer TEXT,
              product TEXT,
              quantity INTEGER,
              total NUMERIC,
              sale_date TEXT,
              synced INTEGER DEFAULT 0
            );`;
          } else if (t === "customers") {
            createSQL = `CREATE TABLE IF NOT EXISTS customers (
              id INTEGER PRIMARY KEY,
              name TEXT,
              phone TEXT,
              place TEXT,
              synced INTEGER DEFAULT 0
            );`;
          } else if (t === "returns") {
            createSQL = `CREATE TABLE IF NOT EXISTS returns (
              id INTEGER PRIMARY KEY,
              sale_id INTEGER,
              customer TEXT,
              product TEXT,
              quantity INTEGER,
              total NUMERIC,
              return_date TEXT,
              synced INTEGER DEFAULT 0
            );`;
          }

          if (createSQL) {
            await pool.query(createSQL);
            console.log(`Created remote table ${t} with synced column`);
          } else {
            console.log(`No create SQL for table ${t}`);
          }
        } catch (createErr) {
          console.log(`Could not create table ${t}:`, createErr.message);
        }
      } else {
        console.log(`Could not ensure synced column on ${t}:`, err.message);
      }
    }
  }
}

ensureSyncedColumns().catch((err) => {
  console.log("Error ensuring synced columns:", err.message);
});

// ==========================
// PRODUCT SYNC
// ==========================

async function syncProducts() {

  console.log("Syncing products...");

  db.all(
    "SELECT * FROM products WHERE synced = 0",
    async (err, products) => {

      if (err) {
        console.log(err.message);
        return;
      }

      for (const product of products) {

        try {

          await pool.query(
            `
            INSERT INTO products
            (
              id,
              name,
              price,
              stock,
              expiry_date,
              synced
            )

            VALUES ($1, $2, $3, $4, $5, 1)

            ON CONFLICT (id)

            DO UPDATE SET
              name = EXCLUDED.name,
              price = EXCLUDED.price,
              stock = EXCLUDED.stock,
              expiry_date = EXCLUDED.expiry_date,
              synced = 1
            `,
            [
              product.id,
              product.name,
              product.price,
              product.stock,
              product.expiry_date,
            ]
          );

          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE products SET synced = 1 WHERE id = ?",
              [product.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          console.log(
            "Product synced:",
            product.name
          );

        } catch (error) {

          console.log(error.message);

        }
      }
    }
  );
}

// ==========================
// SALES SYNC
// ==========================

async function syncSales() {

  console.log("Syncing sales...");

  db.all(
    "SELECT * FROM sales WHERE synced = 0",
    async (err, sales) => {

      if (err) {
        console.log(err.message);
        return;
      }

      for (const sale of sales) {

        try {

          await pool.query(
            `
            INSERT INTO sales
            (
              id,
              customer,
              product,
              quantity,
              total,
              synced
            )

            VALUES ($1, $2, $3, $4, $5, 1)

            ON CONFLICT (id)

            DO UPDATE SET
              customer = EXCLUDED.customer,
              product = EXCLUDED.product,
              quantity = EXCLUDED.quantity,
              total = EXCLUDED.total,
              synced = 1
            `,
            [
              sale.id,
              sale.customer,
              sale.product,
              sale.quantity,
              sale.total,
            ]
          );

          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE sales SET synced = 1 WHERE id = ?",
              [sale.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          console.log(
            "Sale synced:",
            sale.product
          );

        } catch (error) {

          console.log(error.message);

        }
      }
    }
  );
}

// ==========================
// CUSTOMER SYNC
// ==========================

async function syncCustomers() {

  console.log("Syncing customers...");

  db.all(
    "SELECT * FROM customers WHERE synced = 0",
    async (err, customers) => {

      if (err) {
        console.log(err.message);
        return;
      }

      for (const customer of customers) {

        try {

          await pool.query(
            `
            INSERT INTO customers
            (
              id,
              name,
              phone,
              place,
              synced
            )

            VALUES ($1, $2, $3, $4, 1)

            ON CONFLICT (id)

            DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              place = EXCLUDED.place,
              synced = 1
            `,
            [
              customer.id,
              customer.name,
              customer.phone,
              customer.place,
            ]
          );

          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE customers SET synced = 1 WHERE id = ?",
              [customer.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          console.log(
            "Customer synced:",
            customer.name
          );

        } catch (error) {

          console.log(error.message);

        }
      }
    }
  );
}

// ==========================
// RETURNS SYNC
// ==========================

async function syncReturns() {

  console.log("Syncing returns...");

  db.all(
    "SELECT * FROM returns WHERE synced = 0",
    async (err, returnsRows) => {

      if (err) {
        console.log(err.message);
        return;
      }

      for (const r of returnsRows) {

        try {

          await pool.query(
            `
            INSERT INTO returns
            (
              id,
              sale_id,
              customer,
              product,
              quantity,
              total,
              return_date,
              synced
            )

            VALUES ($1, $2, $3, $4, $5, $6, $7, 1)

            ON CONFLICT (id)

            DO UPDATE SET
              sale_id = EXCLUDED.sale_id,
              customer = EXCLUDED.customer,
              product = EXCLUDED.product,
              quantity = EXCLUDED.quantity,
              total = EXCLUDED.total,
              return_date = EXCLUDED.return_date,
              synced = 1
            `,
            [
              r.id,
              r.sale_id,
              r.customer,
              r.product,
              r.quantity,
              r.total,
              r.return_date,
            ]
          );

          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE returns SET synced = 1 WHERE id = ?",
              [r.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          console.log("Return synced:", r.id);

        } catch (error) {
          console.log(error.message);
        }

      }

    }
  );

}

// ==========================
// AUTO SYNC
// ==========================

setInterval(() => {

  console.log("Checking sync...");

  syncProducts();

  syncSales();

  syncCustomers();

  syncReturns();

}, 10000);

// ==========================
// EXPORTS
// ==========================

module.exports = {
  syncProducts,
  syncSales,
  syncCustomers,
  syncReturns,
};