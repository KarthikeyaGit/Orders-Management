require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const orderRouter = require("./routes/orderRoutes");
const productRouter = require("./routes/productRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);

// Serve React static files
app.use(express.static(path.join(__dirname, "view", "dist")));

// Catch-all handler for frontend routes
app.get("*", (req, res) => {
  console.log("req",req);
  res.sendFile(path.join(__dirname, "view", "dist", "index.html"));
});

// Export as a serverless function
module.exports = (req, res) => {
  app(req, res);  // Vercel expects the Express app to be invoked this way
};


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

