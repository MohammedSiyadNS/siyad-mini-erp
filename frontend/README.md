# Al Amana Grocery ERP - Frontend 💻

This directory contains the single-page web application (SPA) frontend for the **Al Amana Grocery ERP**. Built with React 19, Vite, and Tailwind CSS v4, this frontend is optimized for speed, responsive layout transitions, and high-frequencyPoint-of-Sale (POS) cash register interactions.

> ℹ️ **Note**: This application is built as a hybrid offline-first platform. To view the full system architecture, database setup, and synchronization engine, please see the **[Master README at the repository root](../README.md)**.

---

## 🌟 Frontend Key Features

* **Sub-Millisecond Response Optimism**: Frontend routes all CRUD requests directly to the local Express Edge Server (`http://localhost:5000`), meaning queries and checkouts complete in under 5 milliseconds.
* **POS Sales Desk Register**: Supports multi-line sales invoices, dynamic lookup for active customers and products, and on-the-fly total calculation.
* **Client-Side PDF Receipt Compiler**: Uses `jsPDF` to compile clean, formatted invoice receipts locally for customer printouts, eliminating cloud document processing delays.
* **Analytical Dashboard**: Incorporates custom-designed charts from `recharts` to render real-time KPIs (Today's Revenue, Inventory Value, and Low-Stock counts).
* **Protected Routes & Session Checks**: Protects page routes via local storage operator keys, redirecting unauthenticated traffic to the secure login gateway.

---

## 🛠️ Tech Stack & Key Libraries

* **Core Framework**: React 19 (functional hooks state model)
* **Build Tool**: Vite 8 (Hot Module Replacement, optimized chunks compiling)
* **Styling Engine**: Tailwind CSS v4 (utility-first premium layout styling)
* **Data Viz**: Recharts v3 (responsive analytical graph structures)
* **Vector Icons**: Lucide React (featherweight SVG asset icons)
* **PDF Compiler**: jsPDF (client-side PDF canvas generator)
* **Client Routing**: React Router DOM v7 (protected path router)

---

## 📂 Directory Layout

```
frontend/
├── public/              # Static public assets
├── src/
│   ├── components/      # Reusable visual components
│   │   └── Sidebar.jsx  # Main navigation panel with active page states
│   ├── pages/           # Core page views
│   │   ├── About.jsx    # System specifications and technical details
│   │   ├── Customers.jsx# Customer CRUD listing & data sheets
│   │   ├── Dashboard.jsx# KPI gauges & analytical chart cards
│   │   ├── Login.jsx    # User/operator gateway view
│   │   ├── NewSale.jsx  # POS invoice checkout workspace
│   │   ├── Products.jsx # Product CRUD directory & stock tracker
│   │   └── SalesList.jsx# Historical sales registry & returns management
│   ├── App.jsx          # Protected route validation & path router
│   ├── main.css         # Tailwind directives
│   └── main.jsx         # Front-end React loader entry point
├── eslint.config.js     # Code quality and styling rules
├── index.html           # SPA parent canvas file
├── package.json         # Libraries, tools, and execution scripts
└── vite.config.js       # Vite bundler configurations
```

---

## 🚀 Running the Frontend locally

### Prerequisites
Make sure your local Express backend server is running on port `5000` so that API fetch requests succeed.

### Setup Instructions
1. Install front-end dependencies:
   ```bash
   npm install
   ```
2. Start the Vite server locally:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173` to interact with the Point-of-Sale interface.
4. Login using administrative credentials (default: `Admin`).
