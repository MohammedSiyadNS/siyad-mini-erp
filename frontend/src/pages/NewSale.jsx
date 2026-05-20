import { useEffect, useState } from "react";

import {
  ShoppingCart,
  User,
  Package,
  Boxes,
  IndianRupee,
  Receipt,
  Save,
  Barcode,
} from "lucide-react";

function NewSale() {

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(0);
const [saleDate, setSaleDate] = useState(
  new Date().toISOString().split("T")[0]
);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  // FETCH CUSTOMERS
  useEffect(() => {

    fetch("http://localhost:5000/customers")

      .then((res) => res.json())

      .then((data) => {

        setCustomers(data);

      });

  }, []);

  // FETCH PRODUCTS
  useEffect(() => {

    fetch("http://localhost:5000/products")

      .then((res) => res.json())

      .then((data) => {

        setProducts(data);

      });

  }, []);

  // UPDATE PRICE
  useEffect(() => {

    const selectedProduct = products.find(
      (p) => p.name === product
    );

    const quantityNumber = Number(quantity) || 0;

    if (selectedProduct) {

      setPrice(selectedProduct.price);

      setTotal(
        selectedProduct.price * quantityNumber
      );

    } else {
      setPrice(0);
      setTotal(0);
    }

  }, [product, quantity, products]);

  // SAVE SALE
  const handleSubmit = async (e) => {

    e.preventDefault();

    const parsedQuantity = Number(quantity);

    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    const saleData = {
  customer,
  product,
  quantity: parsedQuantity,
  total: Number(total),
  sale_date: saleDate,
};

    await fetch(
      "http://localhost:5000/sales",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(saleData),
      }
    );

    alert("Sale Added Successfully");

    setCustomer("");
    setProduct("");
    setQuantity("");
    setPrice(0);
    setTotal(0);

  };

  // DUMMY BARCODE SCAN
  const handleScan = () => {
    if (products.length === 0) {
      alert("No products available to scan.");
      return;
    }

    setScanning(true);

    setTimeout(() => {
      // try matching by id or name
      let found = products.find((p) => String(p.id) === barcode || p.name === barcode);

      if (!found) {
        // pick a random product as a dummy scan
        found = products[Math.floor(Math.random() * products.length)];
      }

      setProduct(found.name);
      setPrice(found.price);
      setQuantity(1);
      setBarcode("");
      setScanning(false);

      alert(`Scanned: ${found.name}`);
    }, 700);
  };

  return (

    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] p-4 rounded-[35px]">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

        <div>

          <h1 className="text-4xl md:text-5xl font-black text-[#3E2F1C] tracking-tight">

            New Sale

          </h1>

          <p className="text-[#6B5B4D] mt-2 text-base">

            Create and manage professional sales invoices

          </p>

        </div>

        {/* SALES INFO CARD */}
        <div className="bg-white/40 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-white/30">

          <p className="text-sm text-[#6B5B4D]">

            Products Available

          </p>

          <div className="flex items-center gap-3 mt-2">

            <div className="bg-[#C8A97E]/20 p-3 rounded-2xl">

              <Package className="text-[#8B6B43]" />

            </div>

            <h2 className="text-3xl font-bold text-[#3E2F1C]">

              {products.length}

            </h2>

          </div>

        </div>

      </div>

      {/* MAIN CARD */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl border border-white/30 p-5 h-[82vh] overflow-y-auto">

        {/* TITLE */}
        <div className="flex items-center gap-4 mb-6">

          <div className="bg-gradient-to-r from-[#8B6B43] to-[#C8A97E] p-4 rounded-3xl shadow-lg">

            <ShoppingCart className="text-white" />

          </div>

          <div>

            <h2 className="text-3xl font-bold text-[#3E2F1C]">

              Create New Sale

            </h2>

            <p className="text-[#6B5B4D] mt-1">

              Fill all sales transaction details

            </p>

          </div>

        </div>
{/* SALE DATE */}

<input
  type="date"
  value={saleDate}
  onChange={(e) =>
    setSaleDate(e.target.value)
  }

  className="
    bg-white/60
    border
    border-white/30
    rounded-2xl
    p-4
    outline-none
  "
/>
        {/* FORM */}
        <form
          onSubmit={handleSubmit}

          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >

          {/* CUSTOMER */}
          <div>

            <label className="text-sm font-semibold text-[#5A4632] mb-2 block">

              Customer

            </label>

            <div className="relative">

              <User
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  text-[#8B7B6B]
                "
              />

              <select
                value={customer}
                onChange={(e) =>
                  setCustomer(e.target.value)
                }
                required

                className="
                  w-full
                  bg-white/50
                  border
                  border-white/30
                  text-[#3E2F1C]
                  rounded-2xl
                  py-3
                  pl-12
                  pr-5
                  outline-none
                  focus:ring-2
                  focus:ring-[#C8A97E]
                  transition-all
                "
              >

                <option value="">
                  Select Customer
                </option>

                {customers.map((c) => (

                  <option
                    key={c.id}
                    value={c.name}
                  >

                    {c.name}

                  </option>

                ))}

              </select>

            </div>

          </div>

          {/* PRODUCT */}
          <div>

            <label className="text-sm font-semibold text-[#5A4632] mb-2 block">

              Product

            </label>

            <div className="relative">

              <Package
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  text-[#8B7B6B]
                "
              />

              <select
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                required

                className="
                  w-full
                  bg-white/50
                  border
                  border-white/30
                  text-[#3E2F1C]
                  rounded-2xl
                  py-3
                  pl-12
                  pr-5
                  outline-none
                  focus:ring-2
                  focus:ring-[#C8A97E]
                  transition-all
                "
              >

                <option value="">
                  Select Product
                </option>

                {products.map((p) => (

                  <option
                    key={p.id}
                    value={p.name}
                  >

                    {p.name}

                  </option>

                ))}

              </select>

            </div>

          </div>

            {/* BARCODE SCANNER (DUMMY) */}
            <div>

              <label className="text-sm font-semibold text-[#5A4632] mb-2 block">

                Barcode Scanner

              </label>

              <div className="flex gap-2">

                <input
                  type="text"
                  placeholder="Scan barcode or enter id/name"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-white/50 border border-white/30 rounded-2xl px-4 py-3 outline-none text-[#3E2F1C] placeholder-[#8B7B6B] focus:ring-2 focus:ring-[#C8A97E] transition-all"
                />

                <button
                  type="button"
                  onClick={handleScan}
                  disabled={scanning}
                  className="bg-gradient-to-r from-[#8B6B43] to-[#C8A97E] text-white px-4 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all disabled:opacity-60"
                >
                  {scanning ? "Scanning..." : <Barcode size={16} />}
                </button>

              </div>

            </div>

          {/* QUANTITY */}
          <div>

            <label className="text-sm font-semibold text-[#5A4632] mb-2 block">

              Quantity

            </label>

            <div className="relative">

              <Boxes
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  text-[#8B7B6B]
                "
              />

              <input
                type="number"
                min="0"
                placeholder="Enter Quantity"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuantity(value === "" ? "" : Math.max(0, Number(value)));
                }}
                required

                className="
                  w-full
                  bg-white/50
                  border
                  border-white/30
                  rounded-2xl
                  py-3
                  pl-12
                  pr-5
                  outline-none
                  text-[#3E2F1C]
                  placeholder-[#8B7B6B]
                  focus:ring-2
                  focus:ring-[#C8A97E]
                  transition-all
                "
              />

            </div>

          </div>

          {/* PRICE */}
          <div>

            <label className="text-sm font-semibold text-[#5A4632] mb-2 block">

              Product Price

            </label>

            <div className="relative">

              <IndianRupee
                size={18}
                className="
                  absolute
                  left-4
                  top-4
                  text-[#8B7B6B]
                "
              />

              <input
                type="number"
                value={price}
                readOnly

                className="
                  w-full
                  bg-white/50
                  border
                  border-white/30
                  rounded-2xl
                  py-3
                  pl-12
                  pr-5
                  outline-none
                  text-[#3E2F1C]
                  font-semibold
                "
              />

            </div>

          </div>

          {/* TOTAL */}
          <div className="md:col-span-2">

            <label className="text-sm font-semibold text-[#5A4632] mb-2 block">

              Total Amount

            </label>

            <div className="relative">

              <Receipt
                size={18}
                className="
                  absolute
                  left-4
                  top-5
                  text-[#8B6B43]
                "
              />

              <input
                type="number"
                value={total}
                readOnly

                className="
                  w-full
                  bg-gradient-to-r
                  from-[#F3E7D3]
                  to-[#E8DCCB]
                  border
                  border-[#D6C2A8]
                  rounded-2xl
                  py-4
                  pl-12
                  pr-5
                  outline-none
                  text-2xl
                  font-bold
                  text-[#6B4F2A]
                "
              />

            </div>

          </div>

          {/* BUTTON */}
          <div className="md:col-span-2">

            <button
              type="submit"

              className="
                w-full
                bg-gradient-to-r
                from-[#8B6B43]
                to-[#C8A97E]
                hover:scale-[1.01]
                transition-all
                duration-300
                text-white
                py-4
                rounded-3xl
                text-lg
                font-bold
                shadow-2xl
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <Save size={22} />

              Save Sale

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default NewSale;