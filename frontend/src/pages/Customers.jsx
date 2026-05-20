import { useEffect, useState } from "react";

import {
  Users,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";

function Customers() {

  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");

  const [editId, setEditId] = useState(null);

  // FETCH CUSTOMERS
  const fetchCustomers = () => {

    fetch("http://localhost:5000/customers")

      .then((res) => res.json())

      .then((data) => {

        setCustomers(data);

      });

  };

  useEffect(() => {

    fetchCustomers();

  }, []);

  // ADD OR UPDATE CUSTOMER
  const handleSubmit = async (e) => {

    e.preventDefault();

    const customerData = {
      name,
      phone,
      place,
    };

    // UPDATE
    if (editId) {

      await fetch(
        `http://localhost:5000/customers/${editId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(customerData),
        }
      );

      setEditId(null);

    }

    // ADD
    else {

      await fetch(
        "http://localhost:5000/customers",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(customerData),
        }
      );

    }

    setName("");
    setPhone("");
    setPlace("");

    fetchCustomers();

  };

  // DELETE CUSTOMER
  const deleteCustomer = async (id) => {

    await fetch(
      `http://localhost:5000/customers/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchCustomers();

  };

  // EDIT CUSTOMER
  const editCustomer = (customer) => {

    setEditId(customer.id);

    setName(customer.name);
    setPhone(customer.phone);
    setPlace(customer.place);

  };

  return (

    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] p-3 rounded-3xl">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">

        <div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3E2F1C]">

            Customers

          </h1>

          <p className="text-[#6B5B4D] mt-1 text-base">

            Manage all customer records professionally

          </p>

        </div>

        <div className="mt-4 md:mt-0 bg-white/40 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-xl border border-white/30">

          <p className="text-sm text-[#6B5B4D]">

            Total Customers

          </p>

          <h2 className="text-2xl font-bold text-[#3E2F1C] mt-1">

            {customers.length}

          </h2>

        </div>

      </div>

      {/* FORM CARD */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[30px] shadow-2xl p-5 border border-white/30">

        <div className="flex items-center gap-3 mb-5">

          <div className="bg-[#C8A97E]/20 p-3 rounded-2xl">

            <Users className="text-[#8B6B43]" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[#3E2F1C]">

              {editId
                ? "Update Customer"
                : "Add Customer"}

            </h2>

            <p className="text-[#6B5B4D]">

              Enter customer information

            </p>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}

          className="
            grid
            grid-cols-1
            md:grid-cols-4
            gap-4
          "
        >

          {/* NAME */}
          <div className="relative">

            <Users
              className="
                absolute
                left-4
                top-4
                text-[#8B7B6B]
              "
              size={18}
            />

            <input
              type="text"
              placeholder="Customer Name"
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
                text-[#3E2F1C]
                placeholder-[#8B7B6B]
                rounded-2xl
                pl-12
                pr-5
                py-3
                outline-none
                focus:ring-2
                focus:ring-[#C8A97E]
                transition-all
              "
            />

          </div>

          {/* PHONE */}
          <div className="relative">

            <Phone
              className="
                absolute
                left-4
                top-4
                text-[#8B7B6B]
              "
              size={18}
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required

              className="
                w-full
                bg-white/50
                border
                border-white/30
                text-[#3E2F1C]
                placeholder-[#8B7B6B]
                rounded-2xl
                pl-12
                pr-5
                py-3
                outline-none
                focus:ring-2
                focus:ring-[#C8A97E]
                transition-all
              "
            />

          </div>

          {/* PLACE */}
          <div className="relative">

            <MapPin
              className="
                absolute
                left-4
                top-4
                text-[#8B7B6B]
              "
              size={18}
            />

            <input
              type="text"
              placeholder="Place"
              value={place}
              onChange={(e) =>
                setPlace(e.target.value)
              }
              required

              className="
                w-full
                bg-white/50
                border
                border-white/30
                text-[#3E2F1C]
                placeholder-[#8B7B6B]
                rounded-2xl
                pl-12
                pr-5
                py-3
                outline-none
                focus:ring-2
                focus:ring-[#C8A97E]
                transition-all
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

            <UserPlus size={20} />

            {editId
              ? "Update"
              : "Add"}

          </button>

        </form>

      </div>

      {/* TABLE */}
      <div className="mt-5 bg-white/40 backdrop-blur-xl rounded-[30px] shadow-2xl p-5 border border-white/30 overflow-x-auto h-[62vh]">

        <div className="mb-4">

          <h2 className="text-2xl font-bold text-[#3E2F1C]">

            Customer Records

          </h2>

          <p className="text-[#6B5B4D] mt-1">

            All registered customers

          </p>

        </div>

        <table className="w-full">

          <thead>

            <tr className="bg-white/40 text-[#5A4632]">

              <th className="py-3 px-4 text-left rounded-l-2xl">

                ID

              </th>

              <th className="py-3 px-4 text-left">

                Customer

              </th>

              <th className="py-3 px-4 text-left">

                Phone

              </th>

              <th className="py-3 px-4 text-left">

                Place

              </th>

              <th className="py-3 px-4 text-left rounded-r-2xl">

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {customers.map((customer) => (

              <tr
                key={customer.id}

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

                  {customer.id}

                </td>

                {/* CUSTOMER */}
                <td className="px-4">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10
                        h-10
                        rounded-2xl
                        bg-[#C8A97E]/20
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <Users
                        className="text-[#8B6B43]"
                        size={18}
                      />

                    </div>

                    <div>

                      <h3 className="font-bold text-[#3E2F1C]">

                        {customer.name}

                      </h3>

                      <p className="text-sm text-[#8B7B6B]">

                        ERP Customer

                      </p>

                    </div>

                  </div>

                </td>

                {/* PHONE */}
                <td className="px-4 font-medium text-[#5A4632]">

                  {customer.phone}

                </td>

                {/* PLACE */}
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

                    {customer.place}

                  </span>

                </td>

                {/* ACTIONS */}
                <td className="px-4">

                  <div className="flex gap-2">

                    {/* EDIT */}
                    <button
                      onClick={() =>
                        editCustomer(customer)
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
                        deleteCustomer(customer.id)
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

export default Customers;