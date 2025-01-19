const { query } = require("../db");

// Get all orders
const getAllProducts = async (req, res) => {
  try {
    const result = await query("SELECT * FROM products");
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving products");
  }
};



module.exports = { getAllProducts };
