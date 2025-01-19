const { query } = require("../db");

// Get all orders
const getAllOrders = async (req, res) => {
    try {
      const result = await query(`
        SELECT o.id, o.order_description, o.created_at, 
               ARRAY_AGG(opm.product_id) AS product_ids, 
               COUNT(opm.product_id) AS product_count
        FROM orders o
        LEFT JOIN order_product_map opm ON o.id = opm.order_id
        GROUP BY o.id
      `);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving orders");
    }
  };
  

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM orders WHERE id = $1", [id]);
    if (result.length === 0) return res.status(404).send("Order not found");
    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving the order");
  }
};

// Add a new order
const addOrder = async (req, res) => {
    try {
      const { orderDescription, createdAt = new Date(), products } = req.body;
  
      // Insert into the orders table
      const result = await query(
        "INSERT INTO orders (order_description, created_at) VALUES ($1, $2) RETURNING id",
        [orderDescription, createdAt]
      );
  
      // Get the order ID from the inserted order
      const orderId = result[0].id;
  
      // Insert into the order_product_map table
      const productPromises = products.map((productId) =>
        query("INSERT INTO order_product_map (order_id, product_id) VALUES ($1, $2)", [orderId, productId])
      );
      await Promise.all(productPromises);
  
      res.status(201).json({ orderId, orderDescription, createdAt, products });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error adding the order");
    }
  };
  
  

module.exports = addOrder;

// Update order by ID
// Update order by ID
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderDescription, products } = req.body;

    // Step 1: Update the order description
    const orderUpdateResult = await query(
      "UPDATE orders SET order_description = $1 WHERE id = $2 RETURNING *",
      [orderDescription, id]
    );
    if (orderUpdateResult.length === 0) return res.status(404).send("Order not found");

    // Step 2: Delete existing products in the order_product_map table
    await query("DELETE FROM order_product_map WHERE order_id = $1", [id]);

    // Step 3: Insert new products into the order_product_map table
    const productPromises = products.map((productId) =>
      query("INSERT INTO order_product_map (order_id, product_id) VALUES ($1, $2)", [id, productId])
    );
    await Promise.all(productPromises);

    // Respond with the updated order details
    res.status(200).json({
      orderId: id,
      orderDescription,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating the order");
  }
};


// Delete order by ID
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Delete the related entries from the order_product_map table
    const deleteMapResult = await query("DELETE FROM order_product_map WHERE order_id = $1", [id]);
    
    // Step 2: Now delete the order from the orders table
    const result = await query("DELETE FROM orders WHERE id = $1 RETURNING *", [id]);

    if (result.length === 0) {
      return res.status(404).send("Order not found");
    }

    // Return the deleted order as a response (optional)
    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting the order");
  }
};


module.exports = { getAllOrders, getOrderById, addOrder, updateOrder, deleteOrder };
