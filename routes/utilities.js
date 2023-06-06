const express = require("express");
const router = express.Router();
const db = require("../models");
const utilitiesService = require("../services/utilitiesService");
const { body, validationResult } = require("express-validator");

/** Initialize application endpoint**/
router.post("/setup", async (req, res) => {
  const isSetupCompleted = await utilitiesService.setupCompleted();
  if (isSetupCompleted) {
    return res
      .status(409)
      .json({ message: "Setup operation has already been completed" });
  }

  const transaction = await db.sequelize.transaction();

  try {
    let items = null;
    try {
      items = await utilitiesService.fetchItemsFromExternalAPI();
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        message: "Error fetching items from external API: " + error.message,
        stack: error.stack,
        error,
      });
    }

    try {
      await utilitiesService.populateItemsAndCategories(items, { transaction });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        message: "Error populating items and categories: " + error.message,
        stack: error.stack,
        error,
      });
    }

    try {
      await utilitiesService.createRoles({ transaction: transaction });
      const adminRole = await db.Role.findOne({
        where: {
          roleName: "Admin",
        },
      });
      if (!adminRole) {
        throw new Error("Admin role not found after creation");
      }
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        message: "Error creating roles: " + error.message,
      });
    }

    try {
      await utilitiesService.createAdminUser({ transaction: transaction });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        message: "Error creating admin user: " + error.message,
      });
    }

    await transaction.commit();
    res.status(201).json({ message: "Database populated successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res.status(500).json({ message: "External API is not reachable" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

/** Search endpoint**/
router.post(
  "/search",
  [
    body("item_name").optional().isString(),
    body("category_name").optional().isString(),
    body("SKU").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { item_name, category_name, SKU } = req.body;
      let items = [];

      if (item_name && category_name) {
        const categories = await utilitiesService.searchCategoriesByName(
          category_name
        );
        for (const category of categories) {
          const itemsInCategory =
            await utilitiesService.searchItemsByNameAndCategory(
              item_name,
              category.id
            );
          items = [...items, ...itemsInCategory];
        }
      } else if (item_name) {
        items = await utilitiesService.searchItemsByName(item_name);
      } else if (category_name) {
        const categories = await utilitiesService.searchCategoriesByName(
          category_name
        );
        for (const category of categories) {
          const itemsInCategory = await utilitiesService.getItemsInCategory(
            category.id
          );
          items = [...items, ...itemsInCategory];
        }
      } else if (SKU) {
        const item = await utilitiesService.searchItemBySKU(SKU);
        if (item) items = [item];
      }

      if (items.length > 0) {
        return res.status(200).json(items);
      }

      res
        .status(404)
        .json({ message: "No items found matching your criteria" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
