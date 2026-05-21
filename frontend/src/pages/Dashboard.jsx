import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  RotateCcw,
  Bell,
  Calendar,
} from "lucide-react";

import { useEffect, useState } from "react";

const AREA_COLORS = ["#8B6B43", "#C8A97E"];
const DONUT_COLORS = ["#8B6B43", "#C8A97E", "#D2691E", "#DAA520", "#6B8E23"];
const BAR_COLORS  = ["#8B6B43", "#A67C52", "#C8A97E", "#B08968", "#D6C2A8"];

function fmtDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales,     setSales]     = useState([]);
  const [returns,   setReturns]   = useState([]);

  const fetchAll = () => {
    fetch("http://localhost:5000/products").then(r => r.json()).then(setProducts).catch(() => {});
    fetch("http://localhost:5000/customers").then(r => r.json()).then(setCustomers).catch(() => {});
    fetch("http://localhost:5000/sales").then(r => r.json()).then(setSales).catch(() => {});
    fetch("http://localhost:5000/sales/returns").then(r => r.json()).then(setReturns).catch(() => {});
  };

  useEffect(() => {
    fetchAll();
    window.addEventListener("mini-erp:refresh-data", fetchAll);
    return () => window.removeEventListener("mini-erp:refresh-data", fetchAll);
  }, []);

  /* ── derived ── */
  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const returnedQty  = returns.reduce((s, x) => s + x.quantity, 0);

  const today = new Date();
  const expiringProducts = products.filter(p => {
    if (!p.expiry_date) return false;
    const days = Math.ceil((new Date(p.expiry_date) - today) / 86400000);
    return days >= 0 && days <= 1;
  });
  const expiredProducts = products.filter(
    p => p.expiry_date && new Date(p.expiry_date) < today
  );
  const lowStockProducts = products.filter(p => typeof p.stock === 'number' && p.stock < 10);
  const alertCount = expiringProducts.length + expiredProducts.length + lowStockProducts.length;

  const end = new Date(), start = new Date();
  start.setDate(end.getDate() - 6);
  const dateRange = `${fmtDate(start)} – ${fmtDate(end)}`;

  // bar chart
  const barData = sales.reduce((acc, s) => {
    const ex = acc.find(d => d.name === s.product);
    if (ex) ex.revenue += s.total;
    else acc.push({ name: s.product, revenue: s.total });
    return acc;
  }, []);

  // area chart – top-2 products cumulative
  const top2 = [...new Set(
    [...sales].sort((a, b) => b.total - a.total).map(s => s.product)
  )].slice(0, 2);

  const areaData = sales.map((sale, i) => {
    const prev = sales.slice(0, i);
    const pt = { name: `#${i + 1}` };
    top2.forEach(p => {
      pt[p] = prev.filter(x => x.product === p).reduce((s, x) => s + x.total, 0)
              + (sale.product === p ? sale.total : 0);
    });
    return pt;
  });

  // donut: product sales revenue share
  const salesMap = sales.reduce((acc, s) => {
    acc[s.product] = (acc[s.product] || 0) + s.total;
    return acc;
  }, {});
  const totalSales = Object.values(salesMap).reduce((a, b) => a + b, 0);
  const donutData = Object.entries(salesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({
      name,
      value,
      pct: totalSales > 0 ? Math.round((value / totalSales) * 100) : 0,
      color: DONUT_COLORS[i],
    }));
  const top2Pct = donutData.slice(0, 2).reduce((s, d) => s + d.pct, 0);

  const stats = [
    { label: "TOTAL\nPRODUCTS",  value: products.length,   icon: <Package size={18} />,     desc: "Active stock items available for sale." },
    { label: "TOTAL\nCUSTOMERS", value: customers.length,  icon: <Users size={18} />,       desc: "Registered customer accounts and business contacts." },
    { label: "TOTAL\nSALES",     value: sales.length,      icon: <ShoppingCart size={18} />, desc: "Completed invoices processed by the system." },
    { label: "RETURNED\nUNITS",  value: returnedQty,       icon: <RotateCcw size={18} />,   desc: "Products returned to inventory during the current period." },
    { label: "TOTAL\nREVENUE",   value: `₹ ${totalRevenue}`, icon: <IndianRupee size={18} />, desc: "Net sales revenue after returned items are removed from active invoices." },
  ];

  /* ───────────────────────────── RENDER ───────────────────────────── */
  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden",
    }}>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#3E2F1C", margin: 0, lineHeight: 1.1 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#6B5B4D", margin: "2px 0 0" }}>
            Welcome back, Admin 👋
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* date range */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "white", border: "1px solid rgba(200,169,126,0.3)",
            borderRadius: 14, padding: "6px 14px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}>
            <Calendar size={13} color="#8B6B43" />
            <span style={{ fontSize: 12, color: "#3E2F1C", fontWeight: 500 }}>{dateRange}</span>
          </div>

          {/* notifications */}
          <div className="relative group">
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "white", border: "1px solid rgba(200,169,126,0.3)",
              borderRadius: 14, padding: "6px 14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)", cursor: "pointer",
            }}>
              <Bell size={13} color="#8B6B43" />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#3E2F1C", margin: 0, lineHeight: 1 }}>Notifications</p>
                <p style={{ fontSize: 10, color: "#6B5B4D", margin: 0 }}>Expiry & stock alerts</p>
              </div>
              {alertCount > 0 && (
                <span style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#ef4444",
                  color: "white", fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{alertCount}</span>
              )}
            </button>
            {/* dropdown */}
            <div className="absolute right-0 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
              style={{
                width: 280, background: "white", borderRadius: 20, padding: 14,
                boxShadow: "0 16px 48px rgba(0,0,0,0.12)", border: "1px solid rgba(200,169,126,0.2)",
              }}>
              {expiringProducts.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>⚠ Expiring Soon</p>
                  {expiringProducts.map(p => (
                    <div key={p.id} style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "6px 10px", marginBottom: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#3E2F1C", margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>Expiry: {p.expiry_date}</p>
                    </div>
                  ))}
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#b45309", marginBottom: 6 }}>🔻 Low Stock</p>
                  {lowStockProducts.map(p => (
                    <div key={p.id} style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 10, padding: "6px 10px", marginBottom: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#3E2F1C", margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>Stock: {p.stock} units</p>
                    </div>
                  ))}
                </div>
              )}
              {expiredProducts.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", marginBottom: 6 }}>❌ Expired</p>
                  {expiredProducts.map(p => (
                    <div key={p.id} style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "6px 10px", marginBottom: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#3E2F1C", margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>Expired: {p.expiry_date}</p>
                    </div>
                  ))}
                </div>
              )}
              {(expiringProducts.length === 0 && expiredProducts.length === 0 && lowStockProducts.length === 0) && (
                <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", margin: "12px 0" }}>✅ No notifications</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        gap: 10, flexShrink: 0,
      }}>
        {stats.map((card, i) => (
          <div key={i} style={{
            background: "linear-gradient(135deg, #6B4F2A 0%, #8B6B43 100%)",
            borderRadius: 22, padding: "14px 16px",
            boxShadow: "0 8px 24px rgba(107,79,42,0.22)",
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <p style={{
                fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)", margin: 0, whiteSpace: "pre-line", lineHeight: 1.4,
              }}>{card.label}</p>
              <span style={{ color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{card.icon}</span>
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color: "white", margin: "0 0 4px", lineHeight: 1 }}>
              {card.value}
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── MIDDLE ROW: Area + Donut ──────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "2fr 1fr",
        gap: 10, flex: 1, minHeight: 0,
      }}>

        {/* Area chart */}
        <div style={{
          background: "white", borderRadius: 24,
          border: "1px solid rgba(200,169,126,0.2)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          padding: "14px 16px", display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 8, flexShrink: 0 }}>
            {top2.map((name, i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: AREA_COLORS[i] }} />
                <span style={{ fontSize: 12, color: "#3E2F1C", fontWeight: 500 }}>{name}</span>
              </div>
            ))}
            {top2.length === 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>No sales yet</span>}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  {top2.map((name, i) => (
                    <linearGradient key={name} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={AREA_COLORS[i]} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={AREA_COLORS[i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E8DCCB" opacity={0.5} />
                <XAxis dataKey="name" stroke="#6B5B4D" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B5B4D" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8DCCB", fontSize: 11 }} />
                {top2.map((name, i) => (
                  <Area key={name} type="monotone" dataKey={name}
                    stroke={AREA_COLORS[i]} strokeWidth={2.5}
                    fill={`url(#ag${i})`} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div style={{
          background: "white", borderRadius: 24,
          border: "1px solid rgba(200,169,126,0.2)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          padding: "14px 16px", display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minHeight: 0 }}>
            {/* donut */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData.length > 0 ? donutData : [{ name: "No data", value: 1, color: "#E8DCCB" }]}
                    cx="50%" cy="50%" innerRadius={38} outerRadius={55}
                    dataKey="value" strokeWidth={0}
                  >
                    {(donutData.length > 0 ? donutData : [{ color: "#E8DCCB" }]).map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                pointerEvents: "none",
              }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#3E2F1C" }}>{top2Pct}%</span>
              </div>
            </div>

            {/* legend */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#3E2F1C", fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#6B5B4D" }}>₹ {d.value.toFixed(0)} ({d.pct}%)</span>
                </div>
              ))}
              {donutData.length === 0 && <p style={{ fontSize: 12, color: "#9ca3af" }}>No sales data</p>}
            </div>
          </div>

          <button style={{
            marginTop: 10, width: "100%",
            background: "linear-gradient(135deg, #6B4F2A, #8B6B43)",
            color: "white", border: "none", borderRadius: 16, padding: "9px 0",
            fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Check Now
          </button>
        </div>
      </div>

      {/* ── BOTTOM ROW: Bar chart + Recent Sales ─────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 10, flex: 1, minHeight: 0,
      }}>

        {/* Sales Analytics */}
        <div style={{
          background: "white", borderRadius: 24,
          border: "1px solid rgba(200,169,126,0.2)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          padding: "14px 16px", display: "flex", flexDirection: "column",
        }}>
          <div style={{ flexShrink: 0, marginBottom: 4 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#3E2F1C", margin: 0 }}>Sales Analytics</h2>
            <p style={{ fontSize: 11, color: "#6B5B4D", margin: "2px 0 0" }}>Revenue generated by product sales</p>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barCategoryGap="28%" margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E8DCCB" opacity={0.6} />
                <XAxis dataKey="name" stroke="#6B5B4D" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B5B4D" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8DCCB", fontSize: 11 }} />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales */}
        <div style={{
          background: "white", borderRadius: 24,
          border: "1px solid rgba(200,169,126,0.2)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          padding: "14px 16px", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ flexShrink: 0, marginBottom: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#3E2F1C", margin: 0 }}>Recent Sales</h2>
            <p style={{ fontSize: 11, color: "#6B5B4D", margin: "2px 0 0" }}>Latest customer transactions</p>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(200,169,126,0.25)", position: "sticky", top: 0, background: "white" }}>
                  {["Customer", "Product", "Qty", "Total"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", paddingBottom: 6, paddingRight: 10,
                      fontSize: 11, fontWeight: 600, color: "#5A4632",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.slice(-6).reverse().map(sale => (
                  <tr key={sale.id} style={{ borderBottom: "1px solid rgba(200,169,126,0.1)" }}>
                    <td style={{ padding: "7px 10px 7px 0", fontSize: 12, fontWeight: 600, color: "#3E2F1C" }}>{sale.customer}</td>
                    <td style={{ padding: "7px 10px 7px 0", fontSize: 12, color: "#5A4632" }}>{sale.product}</td>
                    <td style={{ padding: "7px 10px 7px 0", fontSize: 12, color: "#5A4632" }}>{sale.quantity}</td>
                    <td style={{ padding: "7px 0",           fontSize: 12, fontWeight: 700, color: "#8B6B43" }}>₹ {sale.total}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "#9ca3af" }}>No sales recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}