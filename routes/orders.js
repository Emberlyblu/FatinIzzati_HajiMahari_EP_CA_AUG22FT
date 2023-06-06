const express = require("express");
const router = express.Router();
const { registeredOnly } = require("../middleware/authMiddlewares.js");
const orderServices = require("../services/orderService.js");

/** Get order endpoint**/
router.get("/", registeredOnly, async (req, res, next) => {
  try {
    let orders;

    if (req.user.role === "Admin") {
      orders = await orderServices.getAllOrders();
    } else {
      orders = await orderServices.getOrders(req.user.id);
    }

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
