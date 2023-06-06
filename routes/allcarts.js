const express = require("express");
const router = express.Router();
const { adminOnly } = require("../middleware/authMiddlewares.js");
const cartServices = require("../services/cartService.js");

/** GET /allcarts endpoint to retrieve all carts*/
router.get("/", adminOnly, async (req, res, next) => {
  try {
    const carts = await cartServices.getAllCarts();
    console.log(carts);
    res.status(200).json(carts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred on the server" });
  }
});

module.exports = router;
