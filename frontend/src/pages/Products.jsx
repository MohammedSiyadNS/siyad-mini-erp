import { useEffect, useState } from "react";

import {
  Package,
  IndianRupee,
  Boxes,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

function Products() {

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");

  // FETCH PRODUCTS
  const fetchProducts = () => {

    fetch("http://localhost:5000/products")

      .then((res) => res.json())

      .then((data) => {

        setProducts(data);

      });

  };

  useEffect(() => {

    fetchProducts();

  }, []);

  // ADD OR UPDATE PRODUCT
  const handleSubmit = async (e) => {

    e.preventDefault();

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      alert("Please enter valid numeric values for price and stock.");
      return;
    }

    if (parsedPrice < 0 || parsedStock < 0) {
      alert("Price and stock cannot be negative.");
      return;
    }

    const productData = {
  name,
  price: parsedPrice,
  stock: parsedStock,
  expiry_date: expiryDate,
};

    // UPDATE
    if (editId) {

      await fetch(
        `http://localhost:5000/products/${editId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(productData),
        }
      );

      setEditId(null);

    }

    // ADD
    else {

      await fetch(
        "http://localhost:5000/products",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(productData),
        }
      );

    }

    setName("");
    setPrice("");
    setStock("");
    setExpiryDate("");

    fetchProducts();

  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {

    await fetch(
      `http://localhost:5000/products/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchProducts();

  };

  // EDIT PRODUCT
  const editProduct = (product) => {

    setEditId(product.id);

    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
    setExpiryDate(product.expiry_date);

  };

  return (

    <div className="min-h-full overflow-auto bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] p-3 rounded-3xl">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">

        <div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3E2F1C]">

            Products

          </h1>

          <p className="text-[#6B5B4D] mt-1 text-base">

            Manage your inventory professionally

          </p>

        </div>

        <div className="mt-4 md:mt-0 bg-white/40 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-white/30">

          <p className="text-sm text-[#6B5B4D]">

            Total Products

          </p>

          <h2 className="text-2xl font-bold text-[#3E2F1C] mt-1">

            {products.length}

          </h2>

        </div>

      </div>

      {/* FORM CARD */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[30px] shadow-2xl p-5 border border-white/30">

        <div className="flex items-center gap-3 mb-5">

          <div className="bg-[#C8A97E]/20 p-3 rounded-2xl">

            <Package className="text-[#8B6B43]" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[#3E2F1C]">

              {editId
                ? "Update Product"
                : "Add Product"}

            </h2>

            <p className="text-[#6B5B4D]">

              Enter product information

            </p>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >

          {/* PRODUCT NAME */}
          <div className="relative">

            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required

              className="
                w-full
                bg-white/50
                border
                border-white/30
                rounded-2xl
                px-5
                py-3
                outline-none
                text-[#3E2F1C]
                placeholder-[#8B7B6B]
                focus:ring-2
                focus:ring-[#C8A97E]
                transition-all
              "
            />

          </div>

          {/* PRICE */}
          <div className="relative">

            <IndianRupee
              className="
                absolute
                left-4
                top-4
                text-[#8B7B6B]
              "
              size={18}
            />

            <input
              type="number"
              min="0"
              placeholder="Price"
              value={price}
              onChange={(e) => {
                const value = e.target.value;
                setPrice(value === "" ? "" : Math.max(0, Number(value)));
              }}
              required

              className="
                w-full
                bg-white/50
                border
                border-white/30
                rounded-2xl
                pl-12
                pr-5
                py-3
                outline-none
                text-[#3E2F1C]
                placeholder-[#8B7B6B]
                focus:ring-2
                focus:ring-[#C8A97E]
                transition-all
              "
            />

          </div>

          {/* STOCK */}
          <div className="relative">

            <Boxes
              className="
                absolute
                left-4
                top-4
                text-[#8B7B6B]
              "
              size={18}
            />

            <input
              type="number"
              min="0"
              placeholder="Stock"
              value={stock}
              onChange={(e) => {
                const value = e.target.value;
                setStock(value === "" ? "" : Math.max(0, Number(value)));
              }}
              required

              className="
                w-full
                bg-white/50
                border
                border-white/30
                rounded-2xl
                pl-12
                pr-5
                py-3
                outline-none
                text-[#3E2F1C]
                placeholder-[#8B7B6B]
                focus:ring-2
                focus:ring-[#C8A97E]
                transition-all
              "
            />

          </div>
          {/* EXPIRY DATE */}
<div className="relative">

  <input
    type="date"

    value={expiryDate}

    onChange={(e) =>
      setExpiryDate(e.target.value)
    }

    required

    className="
      w-full
      bg-gray-100
      border
      border-gray-200
      rounded-2xl
      px-5
      py-4
      outline-none
    "
  />

</div>
          {/* BUTTON */}
          <button
            type="submit"

            className="
              bg-gradient-to-r
              from-[#8B6B43]
              to-[#C8A97E]
              hover:scale-105
              transition-all
              duration-300
              text-white
              rounded-2xl
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              shadow-xl
              py-3
            "
          >

            <Plus size={20} />

            {editId
              ? "Update"
              : "Add"}

          </button>

        </form>

      </div>

      {/* TABLE */}
      <div className="mt-5 bg-white/40 backdrop-blur-xl rounded-[30px] shadow-2xl p-5 border border-white/30 overflow-auto h-[62vh] pb-6">

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#3E2F1C]">Product Inventory</h2>
            <p className="text-[#6B5B4D] mt-1">All available products</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-[#8B6B43]" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/80 border border-[#E8DCCB] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#3E2F1C] placeholder-[#8B7B6B]/70 focus:outline-none"
            />
          </div>

        </div>

        <table className="w-full">

          <thead>

            <tr className="bg-white/40 text-[#5A4632]">

              <th className="py-3 px-4 text-left rounded-l-2xl">

                ID

              </th>

              <th className="py-3 px-4 text-left">

                Product

              </th>

              <th className="py-3 px-4 text-left">

                Price

              </th>

              <th className="py-3 px-4 text-left">

                Stock

              </th>

              <th className="py-3 px-4 text-left rounded-r-2xl">

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {products
              .filter((p) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  String(p.id).includes(q) ||
                  (p.name || "").toLowerCase().includes(q) ||
                  String(p.price).includes(q)
                );
              })
              .map((product) => (

              <tr
                key={product.id}

                className="
                  border-b
                  border-white/20
                  hover:bg-white/20
                  transition-all
                  duration-200
                "
              >

                {/* ID */}
                <td className="py-3 px-4 font-medium text-[#5A4632]">

                  {product.id}

                </td>

                {/* PRODUCT */}
                <td className="px-4">

                  <div className="flex items-center gap-3">

                    <div className="
                      w-10
                      h-10
                      rounded-2xl
                      bg-[#C8A97E]/20
                      flex
                      items-center
                      justify-center
                    ">

                      <Package
                        className="text-[#8B6B43]"
                        size={18}
                      />

                    </div>

                    <div>

                      <h3 className="font-bold text-[#3E2F1C]">

                        {product.name}

                      </h3>

                      <p className="text-sm text-[#8B7B6B]">

                        Inventory Product

                      </p>

                    </div>

                  </div>

                </td>

                {/* PRICE */}
                <td className="px-4 font-bold text-[#8B6B43]">

                  ₹ {product.price}

                </td>

                {/* STOCK */}
                <td className="px-4">

                  <span
                    className="
                      bg-[#C8A97E]/20
                      text-[#6B4F2A]
                      px-3
                      py-1
                      rounded-xl
                      text-sm
                      font-semibold
                    "
                  >

                    {product.stock} Units

                  </span>

                </td>

                {/* ACTIONS */}
                <td className="px-4">

                  <div className="flex gap-2">

                    {/* EDIT */}
                    <button
                      onClick={() =>
                        editProduct(product)
                      }

                      className="
                        bg-gradient-to-r
                        from-[#8B6B43]
                        to-[#A67C52]
                        hover:scale-105
                        transition-all
                        text-white
                        px-4
                        py-2
                        rounded-2xl
                        shadow-lg
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Pencil size={15} />

                      Edit

                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }

                      className="
                        bg-gradient-to-r
                        from-red-500
                        to-pink-600
                        hover:scale-105
                        transition-all
                        text-white
                        px-4
                        py-2
                        rounded-2xl
                        shadow-lg
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Trash2 size={15} />

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Products;