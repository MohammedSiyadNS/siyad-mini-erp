require("./syncService");
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const salesRoutes = require("./routes/salesRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/sales", salesRoutes);

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("Mini ERP Backend Running");
});

// SERVER
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});