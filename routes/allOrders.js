const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/authMiddlewares.js");
const orderServices = require("../services/orderService.js");

/** GET /allorders endpoint to retrieve all orders*/
router.get("/", adminOnly, async (req, res, next) => {
  try {
    const orders = await orderServices.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "An error occurred on the server" });
  }
});

module.exports = router;
