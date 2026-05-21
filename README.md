# Al Amana Grocery ERP 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.0-lightgrey.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-blue.svg)](https://www.sqlite.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue.svg)](https://www.postgresql.org/)

**Al Amana Grocery ERP** is a hybrid, offline-first Enterprise Resource Planning (ERP) platform custom-designed for small-scale retail and grocery stores. 

Traditional cloud-only POS systems are fragile: an internet outage halts checkout lines, causing immediate revenue loss. Al Amana Grocery ERP solves this by routing all frontend operations to a local **Express Edge Node** backed by a **SQLite 3 database**. A background **Sync Engine** handles bidirectional data transfer with a **Supabase PostgreSQL database** in the cloud, utilizing an **Outbox Pattern** with **Last-Write-Wins (LWW)** conflict resolution and **soft-delete precedence**. This guarantees **zero checkout latency** and **100% operational uptime** regardless of internet quality.

---

## 🌟 Key Features

* **Offline-First Outbox Pattern**: Read and write transactions are processed locally in sub-milliseconds. Changes are queued in SQLite with a `synced = 0` state flag and automatically pushed to the cloud once network connectivity is detected.
* **Auto-Probing Connection Monitor**: A backend service uses low-overhead DNS lookups against the PostgreSQL host to monitor connectivity. If the connection fails, it enters offline mode, pausing sync threads to prevent request timeouts.
* **Deterministic Conflict Resolution (LWW)**: Resolves local vs. remote update conflicts using strict ISO 8601 timestamps. The newest timestamp wins, ensuring that updates made while offline are merged correctly once internet connection resumes.
* **Soft-Delete Precedence**: Deletions are treated as priority events. Setting `deleted = 1` takes precedence over standard updates, ensuring deleted items are safely purged across both local and cloud databases.
* **POS Sales Desk & Stock Safeguards**: Supports multi-line sales checkouts, displays real-time calculated pricing, enforces non-negative stock levels, and generates downloadable client receipts in PDF format.
* **Administrative Return & Restocking**: Allows operators to return products, automatically restock item quantities, and log returns under transactional guarantees.
* **Dashboard Analytics**: Displays real-time operational metrics (Today's Sales, Inventory Asset Values, Low-Stock Alerts) using interactive bar and pie charts.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Purpose |
| --- | --- | --- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | UI components, state management, and modern responsive styling. |
| **Data Viz** | Recharts v3 | Interactive KPI graphs and asset analytics on the dashboard. |
| **Receipt Engine** | jsPDF | Dynamic client-side PDF invoice compilation. |
| **Local Server** | Node.js, Express 5 | High-performance local Edge Node serving API endpoints. |
| **Local Database** | SQLite 3 (`sqlite3` v6) | Crash-safe, relational local database for zero-latency lookups. |
| **Cloud Database** | PostgreSQL 17 (Supabase) | Single source of truth for cloud backups and remote reporting. |
| **Sync Client** | `pg` (v8) | Connection pooling driver facilitating secure queries to PostgreSQL. |

---

## 📂 Folder Structure

```
mini-erp/
├── backend/
│   ├── routes/              # Express API route handlers
│   │   ├── customerRoutes.js# Customer CRUD & sync mappings
│   │   ├── productRoutes.js # Product CRUD & sync mappings
│   │   └── salesRoutes.js   # POS sales, stock updates, and returns desk
│   ├── db.js                # Remote PostgreSQL connection pool setup
│   ├── erp.db               # Local SQLite database binary
│   ├── fixSyncFlags.js      # Cloud sync flags recovery utility
│   ├── network.js           # Low-overhead DNS connection monitor
│   ├── server.js            # Express server initialization entry
│   └── syncService.js       # Background synchronization engine (Push/Pull + LWW)
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI elements (Sidebar navigation, etc.)
│   │   ├── pages/           # Core page views (Dashboard, Products, Sales list, POS)
│   │   ├── App.jsx          # Protected route layout & application router
│   │   ├── main.css         # Tailwind directives
│   │   └── main.jsx         # Front-end React entry point
│   ├── package.json         # Front-end dependencies & build scripts
│   └── vite.config.js       # Vite server configurations
└── README.md                # Master project documentation
```

---

## ⚙️ Installation & Setup

Follow these steps to deploy the application on a local environment for review:

### Prerequisites
* **Node.js (v18.0.0 or higher)** installed.
* **npm (v9.0.0 or higher)** installed.
* A remote **PostgreSQL database connection string** (e.g., Supabase or a local PostgreSQL instance).

### 1. Database Setup
The Edge Node automatically configures remote tables on startup via `syncService.ensureSyncedColumns()`. If the tables do not exist on your remote database, the server will create them automatically.

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create an environment configuration file named `.env`:
   ```bash
   touch .env
   ```
3. Set your PostgreSQL database connection string in the `.env` file:
   ```env
   DATABASE_URL=postgres://postgres:password@your-host.supabase.co:5432/postgres
   ```

### 2. Running the Backend (Edge Node)
1. Install the backend dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   npm run dev
   ```
   *The server starts on port `5000` (http://localhost:5000). The console will print PostgreSQL connectivity status and begin the background sync polling loop (every 10 seconds).*

### 3. Running the Frontend App
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local server URL (typically `http://localhost:5173`) to access the interface.

---

## 🧪 Simulating Offline & Sync Modes

1. **Disconnect internet**: Turn off your local network connection, or change the `DATABASE_URL` port in `.env` to an invalid port.
2. **Observe Terminal**: The console will log `Offline. Skipping sync.` every 10 seconds.
3. **Execute POS actions**: Open the POS UI and complete a transaction. The receipt will download in sub-milliseconds, and the sales registry will update instantly.
4. **Inspect SQLite**: Querying the local `sales` table shows the record saved with a `synced = 0` status flag.
5. **Re-connect internet**: Turn on network connectivity. The background Sync Engine detects the connection, pushes the transaction to PostgreSQL, pulls any remote changes, and marks local records as `synced = 1`.

---

## 🔮 Future Improvements

* **Multi-Terminal Vector Clocks**: Replace standard timestamp-based Last-Write-Wins (LWW) resolution with Vector Clocks or Lamport Timestamps. This will prevent conflicts in environments with multiple register terminals where system clocks may not be fully synchronized.
* **WebSocket-Driven Sync Triggering**: Transition from a polling-based sync (every 10 seconds) to a WebSocket-based push protocol. The system will maintain a live socket connection to trigger instant sync cycles on changes, falling back to polling if the socket connection is lost.
* **PWA Offline Execution Capabilities**: Enable Progressive Web App (PWA) configurations with Service Workers to cache assets (HTML/JS) directly in the browser. This will allow cashiers to access and run the frontend interface even if the local host machine is restarted while offline.