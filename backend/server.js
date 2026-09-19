const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shopease-ecommerce-one.vercel.app"
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "ShopEase API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;