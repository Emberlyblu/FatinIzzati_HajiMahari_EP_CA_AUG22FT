const express = require("express");
const router = express.Router();
const { registeredOnly } = require("../middleware/authMiddlewares.js");
const cartServices = require("../services/cartService.js");

/** GET cart endpoint to retrieve user's cart **/
router.get("/", registeredOnly, async (req, res, next) => {
  try {
    const cart = await cartServices.getCart(req.user.id);
    if (!cart || cart.Items.length === 0) {
      return res.status(200).json("Your cart is empty");
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "An error occurred on the server" });
  }
});

/** Deleting all cart items */
router.delete("/:id", registeredOnly, async (req, res, next) => {
  try {
    await cartServices.emptyCart(req.params.id, req.user.id);
    res.status(200).json("Your cart is emptied");
  } catch (error) {
    res.status(500).json({ message: "An error occurred on the server" });
  }
});

module.exports = router;
