const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const ItemService = require("../services/itemService");
const { adminOnly } = require("../middleware/authMiddlewares");
const { body, validationResult } = require("express-validator");

/** Create item endpoint**/
router.post(
  "/",
  adminOnly,
  [
    body("name")
      .isString()
      .withMessage(
        'Missing "name" field. The "name" field is required and it must be a string.'
      ),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage(
        'Missing "price" field. The "price" field is required and it must be a positive number. Please ensure you provide a price greater than zero.'
      ),
    body("stock_quantity")
      .isInt({ gt: 0 })
      .withMessage(
        'Missing "stock_quantity" field. The "stock_quantity" field is required and it must be a positive integer. Please make sure to provide the stock quantity as a number greater than zero.'
      ),
    body("sku")
      .isString()
      .withMessage(
        'Missing "sku" field. The "sku" field is required and it must be a string. Please make sure to provide a valid SKU.'
      ),
    body("categoryId")
      .isInt()
      .withMessage(
        'Missing "categoryId" field. The "categoryId" field is required and it must be an integer. Please ensure you provide a valid category ID.'
      ),
    body("img_url")
      .isString()
      .withMessage("img_url must be a string")
      .isURL()
      .withMessage("img_url must be a valid URL"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newItem = await ItemService.createItem(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      if (err instanceof sequelize.UniqueConstraintError) {
        res.status(400).json({ message: "Item is already created" });
      } else {
        res.status(500).json({ message: err.message });
      }
    }
  }
);

/** Update item endpoint**/
router.put(
  "/:id",
  adminOnly,
  [
    body("name")
      .optional()
      .isString()
      .withMessage('Invalid "name" field. The "name" field must be a string.'),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage(
        'Invalid "price" field. The "price" field must be a positive number.'
      ),
    body("stock_quantity")
      .optional()
      .isInt({ gt: 0 })
      .withMessage(
        'Invalid "stock_quantity" field. The "stock_quantity" field must be a positive integer.'
      ),
    body("sku")
      .optional()
      .isString()
      .withMessage('Invalid "sku" field. The "sku" field must be a string.'),
    body("categoryId")
      .optional()
      .isInt()
      .withMessage(
        'Invalid "categoryId" field. The "categoryId" field must be an integer.'
      ),
    body("img_url")
      .optional()
      .isString()
      .withMessage("img_url must be a string")
      .isURL()
      .withMessage("img_url must be a valid URL"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const updatedItem = await ItemService.updateItem(req.params.id, req.body);
      res.status(200).json(updatedItem);
    } catch (err) {
      if (err.message.includes("not found")) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "An error occurred during item update" });
    }
  }
);

/** Remove item endpoint**/
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await ItemService.deleteItem(req.params.id);
    res.status(200).send("item deleted successfully");
  } catch (err) {
    if (err.message === "Item not found") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "An error occurred during item deletion" });
  }
});

module.exports = router;
