import { useEffect, useState } from "react";

import jsPDF from "jspdf";

import {
  Receipt,
  Trash2,
  Download,
  ShoppingCart,
} from "lucide-react";

function SalesList() {

  const [sales, setSales] = useState([]);

  // FETCH SALES
  const fetchSales = () => {

    fetch("http://localhost:5000/sales")

      .then((res) => res.json())

      .then((data) => {
        setSales(data);
      });

  };

  useEffect(() => {
    fetchSales();
  }, []);

  // DELETE SALE
  const deleteSale = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmDelete) return;

    try {

      await fetch(
        `http://localhost:5000/sales/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchSales();

    } catch (error) {

      console.log(error);

    }
  };

  // RETURN SALE
  const returnSale = async (id) => {

    const confirmReturn = window.confirm(
      "Mark this sale as returned and restore stock?"
    );

    if (!confirmReturn) return;

    try {
      await fetch(`http://localhost:5000/sales/return/${id}`, {
        method: "POST",
      });

      window.dispatchEvent(
        new CustomEvent("mini-erp:refresh-data")
      );
      fetchSales();
    } catch (error) {
      console.log(error);
    }
  };

  // DOWNLOAD PDF INVOICE
  const downloadInvoice = (sale) => {

    const doc = new jsPDF();

    const quantity = Number(sale.quantity) || 0;
    const total = Number(sale.total) || 0;
    const unitPrice = quantity > 0 ? total / quantity : 0;
    const now = new Date();
    const invoiceDate = sale.sale_date
      ? new Date(sale.sale_date).toLocaleDateString()
      : now.toLocaleDateString();

    // HEADER
    doc.setFillColor(139, 107, 67);
    doc.rect(20, 15, 170, 55, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#FFFFFF");
    doc.text("AL AMANA GROCERY", 25, 30);
    doc.setFontSize(10);
    doc.text("POVVAL", 25, 38);
    doc.text("8921980155", 25, 46);
    doc.setFontSize(10);
    doc.text("CUSTOMER SLIP", 25, 54);

    doc.setFontSize(14);
    doc.text("INVOICE", 150, 30, { align: "right" });
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${sale.id}`, 150, 38, { align: "right" });
    doc.text(`Date: ${invoiceDate}`, 150, 44, { align: "right" });

    // CUSTOMER INFO BOX
    doc.setFillColor(243, 231, 211);
    doc.roundedRect(20, 72, 170, 16, 6, 6, "F");
    doc.setTextColor("#3E2F1C");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Customer", 25, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(sale.customer || "N/A", 25, 86);

    // TABLE HEADER
    doc.setFillColor(216, 201, 168);
    doc.rect(20, 90, 170, 10, "F");
    doc.setTextColor("#3E2F1C");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Product", 25, 97);
    doc.text("Qty", 110, 97);
    doc.text("Unit Price", 140, 97, { align: "center" });
    doc.text("Total", 190, 97, { align: "right" });

    // PRODUCT ROW
    doc.setTextColor("#3E2F1C");
    doc.setFont("helvetica", "normal");
    doc.text(sale.product || "-", 25, 110);
    doc.text(String(quantity), 110, 110);
    doc.text(`Rs. ${unitPrice.toFixed(2)}`, 140, 110, { align: "center" });
    doc.text(`Rs. ${total.toFixed(2)}`, 190, 110, {
      align: "right",
    });

    doc.setDrawColor(216, 201, 168);
    doc.line(20, 115, 190, 115);

    // TOTALS BOX
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount", 130, 136);
    doc.text(`Rs. ${total.toFixed(2)}`, 190, 136, {
      align: "right",
    });

    // NOTES
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#6B5B4D");
    doc.text(
      "Thank you for your business. Please keep this invoice for your records.",
      25,
      160
    );

    doc.setTextColor("#8B6B43");
    doc.setFont("helvetica", "bold");
    doc.text("AL AMANA GROCERY", 25, 175);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#6B5B4D");
    doc.text("ERP Billing System", 25, 181);

    // SAVE PDF
    doc.save(`invoice-${sale.id}.pdf`);

  };

  return (

    <div className="min-h-full overflow-auto bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] p-4 rounded-[35px]">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

        <div>

          <h1 className="text-4xl md:text-5xl font-black text-[#3E2F1C] tracking-tight">

            Sales List

          </h1>

          <p className="text-[#6B5B4D] mt-2 text-base">

            All sales invoices and transactions

          </p>

        </div>

        {/* SALES CARD */}
        <div className="bg-white/40 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-white/30">

          <p className="text-sm text-[#6B5B4D]">

            Total Sales

          </p>

          <div className="flex items-center gap-3 mt-2">

            <div className="bg-[#C8A97E]/20 p-3 rounded-2xl">

              <ShoppingCart className="text-[#8B6B43]" />

            </div>

            <h2 className="text-3xl font-bold text-[#3E2F1C]">

              {sales.length}

            </h2>

          </div>

        </div>

      </div>

      {/* MAIN CARD */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl border border-white/30 p-5 h-[82vh] overflow-hidden">

        {/* TITLE */}
        <div className="flex items-center gap-4 mb-6">

          <div className="bg-gradient-to-r from-[#8B6B43] to-[#C8A97E] p-4 rounded-3xl shadow-lg">

            <Receipt className="text-white" />

          </div>

          <div>

            <h2 className="text-3xl font-bold text-[#3E2F1C]">

              Sales Transactions

            </h2>

            <p className="text-[#6B5B4D] mt-1">

              Manage all invoices professionally

            </p>

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-auto h-[65vh] rounded-3xl">

          <table className="w-full">

            <thead>

              <tr className="bg-white/50 text-left sticky top-0">

                <th className="p-4 text-[#5A4632] rounded-l-2xl">
                  ID
                </th>

                <th className="p-4 text-[#5A4632]">
                  Customer
                </th>

                <th className="p-4 text-[#5A4632]">
                  Product
                </th>

                <th className="p-4 text-[#5A4632]">
                  Quantity
                </th>

                <th className="p-4 text-[#5A4632]">
                  Total
                </th>

                <th className="p-4 text-[#5A4632]">
                  Invoice
                </th>

                <th className="p-4 text-[#5A4632]">
                  Return
                </th>

                <th className="p-4 text-[#5A4632] rounded-r-2xl">
                  Delete
                </th>

              </tr>

            </thead>

            <tbody>

              {sales.map((sale) => (

                <tr
                  key={sale.id}

                  className="
                    border-b
                    border-white/20
                    hover:bg-white/20
                    transition-all
                  "
                >

                  <td className="p-4 text-[#5A4632] font-medium">

                    {sale.id}

                  </td>

                  <td className="p-4 font-semibold text-[#3E2F1C]">

                    {sale.customer}

                  </td>

                  <td className="p-4 text-[#5A4632]">

                    {sale.product}

                  </td>

                  <td className="p-4 text-[#5A4632]">

                    {sale.quantity}

                  </td>

                  <td className="p-4 font-bold text-[#8B6B43]">

                    ₹ {sale.total}

                  </td>

                  {/* DOWNLOAD */}
                  <td className="p-4">

                    <button
                      onClick={() =>
                        downloadInvoice(sale)
                      }

                      className="
                        bg-gradient-to-r
                        from-[#8B6B43]
                        to-[#C8A97E]
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

                      <Download size={16} />

                      Download

                    </button>

                  </td>

                  {/* RETURN */}
                  <td className="p-4">

                    <button
                      onClick={() =>
                        returnSale(sale.id)
                      }

                      className="
                        bg-gradient-to-r
                        from-yellow-500
                        to-amber-600
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

                      Return

                    </button>

                  </td>

                  {/* DELETE */}
                  <td className="p-4">

                    <button
                      onClick={() =>
                        deleteSale(sale.id)
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

                      <Trash2 size={16} />

                      Delete

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default SalesList;