const express = require("express");
const router = express.Router();
const { registeredOnly } = require("../middleware/authMiddlewares.js");
const cartServices = require("../services/cartService.js");
const { body, param, validationResult } = require("express-validator");

/** Create cart item endpoint**/
router.post(
  "/",
  registeredOnly,
  [
    body("itemId").isInt().withMessage("Item Id must be an integer"),
    body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be an integer greater than 0"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await cartServices.addItemToCart(
        req.user.id,
        req.body.itemId,
        req.body.quantity
      );
      res.status(201).send("Item added to the cart");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/** Update cart item endpoint**/
router.put(
  "/:id",
  registeredOnly,
  [
    param("id").isInt().withMessage("Cart Item Id must be an integer"),
    body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be an integer greater than 0"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await cartServices.updateCartItem(
        req.params.id,
        req.body.quantity,
        req.user.id
      );
      res.status(200).send("Your item has been updated in the cart");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/** Remove cart item endpoint**/
router.delete("/:id", registeredOnly, async (req, res, next) => {
  try {
    await cartServices.removeCartItem(req.user.id, req.params.id);
    res.status(200).send("item(s) has been removed from the cart");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
