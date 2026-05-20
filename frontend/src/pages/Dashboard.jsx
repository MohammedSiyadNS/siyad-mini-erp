import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  RotateCcw,
} from "lucide-react";

import { useEffect, useState } from "react";

function Dashboard() {

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [returns, setReturns] = useState([]);

  const fetchDashboardData = () => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });

    fetch("http://localhost:5000/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
      });

    fetch("http://localhost:5000/sales")
      .then((res) => res.json())
      .then((data) => {
        setSales(data);
      });

    fetch("http://localhost:5000/sales/returns")
      .then((res) => res.json())
      .then((data) => {
        setReturns(data);
      });
  };

  useEffect(() => {
    fetchDashboardData();

    const handleRefresh = () => {
      fetchDashboardData();
    };

    window.addEventListener(
      "mini-erp:refresh-data",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "mini-erp:refresh-data",
        handleRefresh
      );
    };
  }, []);

  // TOTAL REVENUE
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const returnedProductsCount = returns.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const returnedRevenue = returns.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // CHART DATA
  const chartData = sales.map((sale) => ({
    name: sale.product,
    revenue: sale.total,
  }));

  // CHART COLORS
  const chartColors = [
    "#8B6B43",
    "#A67C52",
    "#C8A97E",
    "#B08968",
    "#D6C2A8",
  ];

  // EXPIRY CHECK
  const today = new Date();

  const expiringProducts = products.filter((product) => {

    if (!product.expiry_date) return false;

    const expiry = new Date(product.expiry_date);

    const difference = expiry - today;

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return daysLeft <= 1 && daysLeft >= 0;

  });

  const expiredProducts = products.filter((product) => {

    if (!product.expiry_date) return false;

    const expiry = new Date(product.expiry_date);

    return expiry < today;

  });

  return (

    <div className="h-screen overflow-auto bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] p-3 rounded-[35px]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">

        <div>

          <h1 className="text-4xl md:text-5xl font-black text-[#3E2F1C] tracking-tight">

            Dashboard

          </h1>

          <p className="text-[#6B5B4D] mt-1 text-base">

            Welcome back, Admin 👋

          </p>

        </div>

        <div className="flex items-center gap-4">

          {/* NOTIFICATION BUTTON */}
          <div className="relative group">

            <button
              className="
                bg-white/40
                backdrop-blur-xl
                px-5
                py-3
                rounded-3xl
                shadow-2xl
                border
                border-white/30
                flex
                items-center
                gap-3
                hover:scale-105
                transition-all
              "
            >

              <div className="text-2xl">

                🔔

              </div>

              <div className="text-left">

                <h2 className="font-bold text-[#3E2F1C]">

                  Notifications

                </h2>

                <p className="text-xs text-[#6B5B4D]">

                  Product expiry alerts

                </p>

              </div>

              <div
                className="
                  bg-red-500
                  text-white
                  text-xs
                  font-bold
                  w-6
                  h-6
                  rounded-full
                  flex
                  items-center
                  justify-center
                "
              >

                {expiringProducts.length +
                  expiredProducts.length}

              </div>

            </button>

            {/* DROPDOWN */}
            <div
              className="
                absolute
                right-0
                mt-3
                w-[350px]
                bg-white/90
                backdrop-blur-2xl
                rounded-3xl
                shadow-2xl
                border
                border-white/30
                p-5
                opacity-0
                invisible
                group-hover:opacity-100
                group-hover:visible
                transition-all
                duration-300
                z-50
              "
            >

              {/* EXPIRING PRODUCTS */}
              {expiringProducts.length > 0 && (

                <div className="mb-5">

                  <h2 className="text-lg font-bold text-yellow-700 mb-3">

                    ⚠ Expiring Soon

                  </h2>

                  <div className="space-y-3">

                    {expiringProducts.map((product) => (

                      <div
                        key={product.id}

                        className="
                          bg-yellow-50
                          border
                          border-yellow-200
                          rounded-2xl
                          p-3
                        "
                      >

                        <h3 className="font-semibold text-[#3E2F1C]">

                          {product.name}

                        </h3>

                        <p className="text-sm text-gray-500">

                          Expiry:
                          {" "}
                          {product.expiry_date}

                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              )}

              {/* EXPIRED PRODUCTS */}
              {expiredProducts.length > 0 && (

                <div>

                  <h2 className="text-lg font-bold text-red-700 mb-3">

                    ❌ Expired Products

                  </h2>

                  <div className="space-y-3">

                    {expiredProducts.map((product) => (

                      <div
                        key={product.id}

                        className="
                          bg-red-50
                          border
                          border-red-200
                          rounded-2xl
                          p-3
                        "
                      >

                        <h3 className="font-semibold text-[#3E2F1C]">

                          {product.name}

                        </h3>

                        <p className="text-sm text-gray-500">

                          Expired:
                          {" "}
                          {product.expiry_date}

                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              )}

              {/* EMPTY */}
              {expiringProducts.length === 0 &&
                expiredProducts.length === 0 && (

                <div className="text-center py-6">

                  <h2 className="text-3xl">

                    ✅

                  </h2>

                  <p className="text-gray-500 mt-2">

                    No expiry notifications

                  </p>

                </div>

              )}

            </div>

          </div>

          {/* BUSINESS OVERVIEW */}
          <div className="bg-white/40 backdrop-blur-xl px-5 py-3 rounded-3xl shadow-2xl border border-white/30">

            <p className="text-sm text-[#6B5B4D]">

              Mini ERP System

            </p>

            <h2 className="text-2xl font-bold text-[#3E2F1C] mt-1">

              Business Overview

            </h2>

          </div>

        </div>

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

        {/* PRODUCTS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B4F2A] to-[#8B6B43] text-white p-6 rounded-[32px] shadow-[0_24px_45px_-30px_rgba(0,0,0,0.5)] border border-white/20 hover:-translate-y-1 transition-transform duration-300">

          <div className="absolute right-5 top-5 opacity-10 text-[96px] font-black">
            P
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Total Products</p>
              <p className="text-3xl font-bold text-white">{products.length}</p>
            </div>
            <Package size={28} className="text-white" />
          </div>
          <p className="text-sm text-white/80">Active stock items available for sale.</p>
        </div>

        {/* CUSTOMERS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B4F2A] to-[#8B6B43] text-white p-6 rounded-[32px] shadow-[0_24px_45px_-30px_rgba(0,0,0,0.5)] border border-white/20 hover:-translate-y-1 transition-transform duration-300">

          <div className="absolute right-5 top-5 opacity-10 text-[96px] font-black">
            C
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Total Customers</p>
              <p className="text-3xl font-bold text-white">{customers.length}</p>
            </div>
            <Users size={28} className="text-white" />
          </div>
          <p className="text-sm text-white/80">Registered customer accounts and business contacts.</p>
        </div>

        {/* SALES */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B4F2A] to-[#8B6B43] text-white p-6 rounded-[32px] shadow-[0_24px_45px_-30px_rgba(0,0,0,0.5)] border border-white/20 hover:-translate-y-1 transition-transform duration-300">

          <div className="absolute right-5 top-5 opacity-10 text-[96px] font-black">
            S
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Total Sales</p>
              <p className="text-3xl font-bold text-white">{sales.length}</p>
            </div>
            <ShoppingCart size={28} className="text-white" />
          </div>
          <p className="text-sm text-white/80">Completed invoices processed by the system.</p>
        </div>

        {/* RETURNS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B4F2A] to-[#8B6B43] text-white p-6 rounded-[32px] shadow-[0_24px_45px_-30px_rgba(0,0,0,0.5)] border border-white/20 hover:-translate-y-1 transition-transform duration-300">

          <div className="absolute right-5 top-5 opacity-10 text-[96px] font-black">
            R
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Returned Units</p>
              <p className="text-3xl font-bold text-white">{returnedProductsCount}</p>
            </div>
            <RotateCcw size={28} className="text-white" />
          </div>
          <p className="text-sm text-white/80">Products returned to inventory during the current period.</p>
        </div>

        {/* REVENUE */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6B4F2A] to-[#8B6B43] text-white p-6 rounded-[32px] shadow-[0_24px_45px_-30px_rgba(0,0,0,0.5)] border border-white/20 hover:-translate-y-1 transition-transform duration-300">

          <div className="absolute right-5 top-5 opacity-10 text-[96px] font-black">
            ₹
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Total Revenue</p>
              <p className="text-3xl font-bold text-white">₹ {totalRevenue}</p>
            </div>
            <IndianRupee size={28} className="text-white" />
          </div>
          <p className="text-sm text-white/80">Net sales revenue after returned items are removed from active invoices.</p>
        </div>

      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4 h-[58vh]">

        {/* SALES ANALYTICS */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl p-5 border border-white/30">

          <div className="mb-4">

            <h2 className="text-2xl font-bold text-[#3E2F1C]">

              Sales Analytics

            </h2>

            <p className="text-[#6B5B4D] mt-1 text-sm">

              Revenue generated by product sales

            </p>

          </div>

          <div className="w-full h-[320px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={chartData}
                barCategoryGap="20%"
              >

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#C8A97E"
                  opacity={0.5}
                />

                <XAxis
                  dataKey="name"
                  stroke="#6B5B4D"
                />

                <YAxis
                  stroke="#6B5B4D"
                />

                <Tooltip />

                <Bar
                  dataKey="revenue"
                  radius={[14, 14, 0, 0]}
                >

                  {chartData.map((entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        chartColors[
                          index % chartColors.length
                        ]
                      }
                    />

                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* RECENT SALES */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl p-5 border border-white/30 overflow-hidden">

          <div className="mb-4">

            <h2 className="text-2xl font-bold text-[#3E2F1C]">

              Recent Sales

            </h2>

            <p className="text-[#6B5B4D] mt-1 text-sm">

              Latest customer transactions

            </p>

          </div>

          <div className="overflow-auto h-[240px] rounded-2xl">

            <table className="w-full">

              <thead>

                <tr className="bg-white/50 text-[#5A4632] sticky top-0">

                  <th className="py-3 px-4 text-left rounded-l-2xl">

                    Customer

                  </th>

                  <th className="py-3 px-4 text-left">

                    Product

                  </th>

                  <th className="py-3 px-4 text-left">

                    Quantity

                  </th>

                  <th className="py-3 px-4 text-left rounded-r-2xl">

                    Total

                  </th>

                </tr>

              </thead>

              <tbody>

                {sales.slice(-5).reverse().map((sale) => (

                  <tr
                    key={sale.id}

                    className="
                      border-b
                      border-white/20
                      hover:bg-white/20
                      transition-all
                    "
                  >

                    <td className="py-3 px-4 font-semibold text-[#3E2F1C]">

                      {sale.customer}

                    </td>

                    <td className="px-4 text-[#5A4632]">

                      {sale.product}

                    </td>

                    <td className="px-4 text-[#5A4632]">

                      {sale.quantity}

                    </td>

                    <td className="px-4 font-bold text-[#8B6B43]">

                      ₹ {sale.total}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="mt-6 bg-[#F7F3EA] rounded-[28px] border border-[#E8DCCB] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#3E2F1C]">Recent Returns</h3>
                <p className="text-sm text-[#6B5B4D]">Track products returned to inventory.</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-[#8B7B6B]">Returned value</p>
                <p className="text-lg font-semibold text-[#3E2F1C]">₹ {returnedRevenue}</p>
              </div>
            </div>

            {returns.length > 0 ? (
              <div className="space-y-3">
                {returns.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-3xl bg-white p-3 shadow-sm border border-[#E8DCCB]"
                  >
                    <div>
                      <p className="font-semibold text-[#3E2F1C]">{item.product}</p>
                      <p className="text-sm text-[#6B5B4D]">{item.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#8B6B43]">{item.quantity} units</p>
                      <p className="text-sm text-[#6B5B4D]">₹ {item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-[#6B5B4D]">
                No recent returns recorded.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;