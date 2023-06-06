const express = require("express");
const router = express.Router();
const categoryServices = require("../services/categoryService.js");

/** Get categories endpoint**/
router.get("/", async (req, res) => {
  try {
    const categories = await categoryServices.getCategories(req.user.role);
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
