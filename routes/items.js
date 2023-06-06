const express = require("express");
const router = express.Router();
const ItemService = require("../services/itemService");

/** Get items endpoint**/
router.get("/", async (req, res) => {
  try {
    const items = await ItemService.getItems(req.user.role);
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
