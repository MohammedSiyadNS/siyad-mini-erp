const dns = require("dns");
const { URL } = require("url");

/**
 * Checks if the system can resolve the hostname of the Supabase PostgreSQL database.
 * Uses a 3-second timeout to prevent hanging.
 * @returns {Promise<boolean>} Resolves to true if the host is reachable, otherwise false.
 */
async function isOnline() {
  return new Promise((resolve) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      resolve(false);
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 3000);

    try {
      let hostname = "";
      if (dbUrl.includes("@")) {
        // Split by @ to support general Postgres connection strings securely
        const parts = dbUrl.split("@")[1];
        hostname = parts.split("/")[0].split(":")[0];
      } else {
        hostname = new URL(dbUrl).hostname;
      }

      if (!hostname) {
        clearTimeout(timeout);
        resolve(false);
        return;
      }

      dns.lookup(hostname, (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      });
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    }
  });
}

module.exports = { isOnline };
