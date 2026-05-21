const sqlite3 = require("sqlite3").verbose();
const pool = require("./db");
const { isOnline } = require("./network");

const db = new sqlite3.Database("./erp.db");

// Helper to compare database values safely across SQLite and Postgres type differences.
// Postgres NUMERIC returns "7.00" while SQLite INTEGER returns 7 — these must be equal.
function valuesEqual(a, b) {
  if (a === null && b === null) return true;
  if (a === undefined && b === undefined) return true;
  if (a === null || a === undefined) return b === null || b === undefined || b === '';
  if (b === null || b === undefined) return a === null || a === undefined || a === '';
  // Numeric comparison: handles Postgres "7.00" vs SQLite 7
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB) && isFinite(numA) && isFinite(numB)) {
    return numA === numB;
  }
  return String(a) === String(b);
}

// Ensure remote Postgres tables and local SQLite tables have proper schemas
async function ensureSyncedColumns() {
  const tables = ["products", "sales", "customers", "returns"];

  for (const t of tables) {
    try {
      // 1. Postgres schema updates
      await pool.query(
        `ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS synced INTEGER DEFAULT 0;`
      );
      await pool.query(
        `ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS deleted INTEGER DEFAULT 0;`
      );
      await pool.query(
        `ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`
      );
      await pool.query(
        `UPDATE ${t} SET deleted = 0 WHERE deleted IS NULL;`
      );
      await pool.query(
        `UPDATE ${t} SET server_timestamp = CURRENT_TIMESTAMP WHERE server_timestamp IS NULL;`
      );
      console.log(`Ensured PG synced/deleted/timestamp columns and default values on ${t}`);
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
              synced INTEGER DEFAULT 0,
              deleted INTEGER DEFAULT 0,
              server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );`;
          } else if (t === "sales") {
            createSQL = `CREATE TABLE IF NOT EXISTS sales (
              id INTEGER PRIMARY KEY,
              customer TEXT,
              product TEXT,
              quantity INTEGER,
              total NUMERIC,
              sale_date TEXT,
              synced INTEGER DEFAULT 0,
              deleted INTEGER DEFAULT 0,
              server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );`;
          } else if (t === "customers") {
            createSQL = `CREATE TABLE IF NOT EXISTS customers (
              id INTEGER PRIMARY KEY,
              name TEXT,
              phone TEXT,
              place TEXT,
              synced INTEGER DEFAULT 0,
              deleted INTEGER DEFAULT 0,
              server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
              synced INTEGER DEFAULT 0,
              deleted INTEGER DEFAULT 0,
              server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );`;
          }

          if (createSQL) {
            await pool.query(createSQL);
            console.log(`Created remote table ${t} with synced/deleted/timestamp columns`);
          }
        } catch (createErr) {
          console.log(`Could not create table ${t}:`, createErr.message);
        }
      } else {
        console.log(`Could not ensure synced columns on PG table ${t}:`, err.message);
      }
    }

    try {
      // 2. SQLite schema updates (ensure all expected columns exist on local)
      const sqTableCols = {
        products: [
          { name: 'name', type: 'TEXT' },
          { name: 'price', type: 'INTEGER' },
          { name: 'stock', type: 'INTEGER' },
          { name: 'expiry_date', type: 'TEXT' }
        ],
        sales: [
          { name: 'customer', type: 'TEXT' },
          { name: 'product', type: 'TEXT' },
          { name: 'quantity', type: 'INTEGER' },
          { name: 'total', type: 'INTEGER' },
          { name: 'sale_date', type: 'TEXT' }
        ],
        customers: [
          { name: 'name', type: 'TEXT' },
          { name: 'phone', type: 'TEXT' },
          { name: 'place', type: 'TEXT' }
        ],
        returns: [
          { name: 'sale_id', type: 'INTEGER' },
          { name: 'customer', type: 'TEXT' },
          { name: 'product', type: 'TEXT' },
          { name: 'quantity', type: 'INTEGER' },
          { name: 'total', type: 'INTEGER' },
          { name: 'return_date', type: 'TEXT' }
        ]
      };

      const expectedCols = [
        ...(sqTableCols[t] || []),
        { name: 'synced', type: 'INTEGER DEFAULT 0' },
        { name: 'deleted', type: 'INTEGER DEFAULT 0' },
        { name: 'server_timestamp', type: 'TEXT' }
      ];

      await new Promise((resolve) => {
        let chain = Promise.resolve();
        for (const col of expectedCols) {
          chain = chain.then(() => {
            return new Promise((resCol) => {
              db.run(`ALTER TABLE ${t} ADD COLUMN ${col.name} ${col.type}`, () => {
                resCol();
              });
            });
          });
        }
        chain.then(() => {
          // Set defaults for NULL values
          db.run(`UPDATE ${t} SET deleted = 0 WHERE deleted IS NULL`, () => {
            db.run(`UPDATE ${t} SET server_timestamp = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE server_timestamp IS NULL`, () => {
              if (t === 'sales') {
                db.run(`UPDATE sales SET sale_date = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE sale_date IS NULL`, () => {
                  resolve();
                });
              } else if (t === 'returns') {
                db.run(`UPDATE returns SET return_date = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE return_date IS NULL`, () => {
                  resolve();
                });
              } else {
                resolve();
              }
            });
          });
        });
      });
      console.log(`Ensured SQLite schema and columns on ${t}`);
    } catch (sqliteErr) {
      console.log(`Could not ensure SQLite columns on ${t}:`, sqliteErr.message);
    }
  }
}

ensureSyncedColumns().catch((err) => {
  console.log("Error ensuring synced columns:", err.message);
});

async function pushToPostgres(tableName, localRecord, dataCols) {
  const pgCols = ['id', ...dataCols, 'deleted', 'synced'];
  const placeholders = pgCols.map((_, idx) => `$${idx + 1}`).join(', ');
  const values = [...pgCols.slice(0, -1).map(c => localRecord[c]), 1];
  const query = `
    INSERT INTO ${tableName} (${pgCols.join(', ')}, server_timestamp)
    VALUES (${placeholders}, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      ${dataCols.map(c => `${c} = EXCLUDED.${c}`).join(', ')},
      deleted = EXCLUDED.deleted,
      synced = 1,
      server_timestamp = CURRENT_TIMESTAMP
    RETURNING server_timestamp
  `;
  const res = await pool.query(query, values);
  return res.rows[0].server_timestamp;
}

async function insertLocalRecord(tableName, record, dataCols) {
  const sqCols = ['id', ...dataCols, 'deleted', 'server_timestamp', 'synced'];
  const placeholders = sqCols.map(() => '?').join(', ');
  const tsStr = record.server_timestamp ? new Date(record.server_timestamp).toISOString() : new Date().toISOString();
  const values = [
    record.id,
    ...dataCols.map(c => record[c]),
    record.deleted || 0,
    tsStr,
    1
  ];
  const query = `INSERT INTO ${tableName} (${sqCols.join(', ')}) VALUES (${placeholders})`;
  await new Promise((resolve, reject) => {
    db.run(query, values, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function updateLocalRecord(tableName, record, synced, serverTimestamp) {
  const cols = [];
  const values = [];
  if (tableName === 'products') {
    cols.push('name', 'price', 'stock', 'expiry_date');
    values.push(record.name, record.price, record.stock, record.expiry_date);
  } else if (tableName === 'customers') {
    cols.push('name', 'phone', 'place');
    values.push(record.name, record.phone, record.place);
  } else if (tableName === 'sales') {
    cols.push('customer', 'product', 'quantity', 'total', 'sale_date');
    values.push(record.customer, record.product, record.quantity, record.total, record.sale_date);
  } else if (tableName === 'returns') {
    cols.push('sale_id', 'customer', 'product', 'quantity', 'total', 'return_date');
    values.push(record.sale_id, record.customer, record.product, record.quantity, record.total, record.return_date);
  }

  cols.push('deleted', 'server_timestamp', 'synced');
  const tsStr = serverTimestamp ? new Date(serverTimestamp).toISOString() : new Date().toISOString();
  values.push(record.deleted || 0, tsStr, synced);
  values.push(record.id);

  const setClause = cols.map(c => `${c} = ?`).join(', ');
  const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
  await new Promise((resolve, reject) => {
    db.run(query, values, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function markLocalSynced(tableName, id, serverTimestamp) {
  const tsStr = serverTimestamp ? new Date(serverTimestamp).toISOString() : new Date().toISOString();
  const query = `UPDATE ${tableName} SET synced = 1, server_timestamp = ? WHERE id = ?`;
  await new Promise((resolve, reject) => {
    db.run(query, [tsStr, id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function syncTable(tableName, dataCols) {
  console.log(`Syncing ${tableName}...`);
  try {
    const localRows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const pgRes = await pool.query(`SELECT * FROM ${tableName}`);
    const pgRows = pgRes.rows;

    const localMap = new Map(localRows.map(r => [r.id, r]));
    const remoteMap = new Map(pgRows.map(r => [r.id, r]));
    const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

    for (const id of allIds) {
      const local = localMap.get(id);
      const remote = remoteMap.get(id);

      if (local && !remote) {
        // Case 1: Local only. Push.
        const newTimestamp = await pushToPostgres(tableName, local, dataCols);
        await markLocalSynced(tableName, id, newTimestamp);
        console.log(`Pushed new ${tableName} ID ${id} to server`);
      } else if (!local && remote) {
        // Case 2: Remote only. Pull.
        await insertLocalRecord(tableName, remote, dataCols);
        console.log(`Pulled new ${tableName} ID ${id} from server`);
      } else if (local && remote) {
        // Case 3: Both exist. Resolve conflict.
        const localTime = new Date(local.server_timestamp || 0).getTime();
        const remoteTime = new Date(remote.server_timestamp || 0).getTime();

        // Use Number() to handle type coercion differences between SQLite and Postgres drivers
        const localDeleted = Number(local.deleted) === 1;
        const remoteDeleted = Number(remote.deleted) === 1;
        const localSynced = Number(local.synced) === 1;

        if (localDeleted || remoteDeleted) {
          // Soft-delete precedence: a deleted record always wins any update
          if (remoteDeleted && !localDeleted) {
            // Remote was deleted — propagate to local
            await updateLocalRecord(tableName, remote, 1, remote.server_timestamp);
            console.log(`Soft delete propagated: local ID ${id} deleted (remote was deleted)`);
          } else if (localDeleted && !remoteDeleted) {
            // Local was deleted — push to Postgres
            const newTimestamp = await pushToPostgres(tableName, local, dataCols);
            await markLocalSynced(tableName, id, newTimestamp);
            console.log(`Soft delete propagated: remote ID ${id} deleted (local was deleted)`);
          } else {
            // Both already deleted — ensure local is marked synced
            if (!localSynced) {
              await markLocalSynced(tableName, id, remote.server_timestamp);
            }
          }
        } else if (!localSynced) {
          // Local has pending unsynced changes — apply LWW by server timestamp
          if (localTime > remoteTime) {
            // Local is newer — push to Postgres
            const newTimestamp = await pushToPostgres(tableName, local, dataCols);
            await markLocalSynced(tableName, id, newTimestamp);
            console.log(`LWW: ID ${id} pushed to server (local was newer)`);
          } else {
            // Remote is newer or equal — remote wins
            await updateLocalRecord(tableName, remote, 1, remote.server_timestamp);
            console.log(`LWW: ID ${id} pulled from server (remote was newer)`);
          }
        } else {
          // Both synced — only compare data columns and deleted flag, NOT timestamp.
          // Timestamp comparison is excluded because Postgres microsecond precision
          // cannot round-trip through JS Date milliseconds, causing an infinite re-sync loop.
          const isDifferent = dataCols.some(c => !valuesEqual(local[c], remote[c])) ||
                              Number(local.deleted) !== Number(remote.deleted);
          if (isDifferent) {
            await updateLocalRecord(tableName, remote, 1, remote.server_timestamp);
            console.log(`Synced remote updates to local ID ${id}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error syncing table ${tableName}:`, err.message);
  }
}

async function syncProducts() {
  await syncTable('products', ['name', 'price', 'stock', 'expiry_date']);
}

async function syncSales() {
  await syncTable('sales', ['customer', 'product', 'quantity', 'total', 'sale_date']);
}

async function syncCustomers() {
  await syncTable('customers', ['name', 'phone', 'place']);
}

async function syncReturns() {
  await syncTable('returns', ['sale_id', 'customer', 'product', 'quantity', 'total', 'return_date']);
}

// AUTO SYNC Interval (every 10 seconds, checks online status first)
setInterval(async () => {
  console.log("Checking sync...");
  const online = await isOnline();
  if (!online) {
    console.log("Offline. Skipping sync.");
    return;
  }

  try {
    await syncProducts();
    await syncSales();
    await syncCustomers();
    await syncReturns();
  } catch (err) {
    console.error("Error during sync iteration:", err.message);
  }
}, 10000);

module.exports = {
  syncProducts,
  syncSales,
  syncCustomers,
  syncReturns,
};