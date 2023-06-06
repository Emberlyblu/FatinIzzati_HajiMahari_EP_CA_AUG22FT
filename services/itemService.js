const { Op } = require("sequelize");
const db = require("../models");

class ItemService {
  static async getItems(role) {
    let items;
    switch (role) {
      case "Admin":
      case "User":
        items = await db.Item.findAll({
          include: {
            model: db.Category,
            as: "Category",
          },
        });
        return items;
      case "guest":
        items = await db.Item.findAll({
          where: {
            stock_quantity: {
              [Op.gt]: 0,
            },
          },
          include: {
            model: db.Category,
            as: "Category",
          },
        });
        return items;
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }

  static async getItemsCount() {
    return db.Item.count();
  }

  static async createItem(itemData) {
    return db.Item.create(itemData);
  }

  static async searchItemsByName(name) {
    return db.Item.findAll({
      where: {
        name: {
          [Op.like]: "%" + name + "%",
        },
      },
    });
  }

  static async searchItemsByNameAndCategory(name, category_id) {
    return db.Item.findAll({
      where: {
        name: {
          [Op.iLike]: "%" + name + "%",
        },
        categoryId: category_id,
      },
    });
  }

  static async getItemsInCategory(category_id) {
    return db.Item.findAll({
      where: {
        categoryId: category_id,
      },
    });
  }

  static async searchItemBySKU(SKU) {
    return db.Item.findOne({
      where: {
        SKU,
      },
    });
  }

  static async updateItem(itemId, itemData) {
    try {
      const item = await db.Item.findByPk(itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      return item.update(itemData);
    } catch (error) {
      throw error;
    }
  }

  static async deleteItem(itemId) {
    try {
      const item = await db.Item.findByPk(itemId);
      if (!item) {
        throw new Error("Item not found");
      }
      await item.destroy();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ItemService;
