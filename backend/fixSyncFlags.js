const pool = require('./db');

async function main() {
  const tables = ['products', 'sales', 'customers', 'returns'];

  try {
    for (const t of tables) {
      try {
        const res = await pool.query(`UPDATE ${t} SET synced = 1 WHERE synced = 0`);
        // Postgres client returns rowCount
        console.log(`Updated ${t}:`, res && res.rowCount !== undefined ? `${res.rowCount} rows` : 'ok');
      } catch (err) {
        console.log(`Could not update ${t}:`, err.message);
      }
    }

    console.log('Finished updating synced flags.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating synced flags:', err.message);
    process.exit(1);
  }
}

main();
