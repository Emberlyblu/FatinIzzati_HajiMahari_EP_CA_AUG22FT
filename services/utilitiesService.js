const { Op } = require("sequelize");
const db = require("../models");
const userService = require("./userService");
const axios = require("axios");
require("dotenv").config();

class UtilitiesService {
  static async fetchItemsFromExternalAPI() {
    try {
      const response = await axios.get(
        process.env.EXTERNAL_API_URL || "http://143.42.108.232:8888/items/stock"
      );
      if (!Array.isArray(response.data.data)) {
        throw new Error("Unexpected data format from API");
      }
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  static async setupCompleted() {
    try {
      const count = await db.Item.count();
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  static async populateItemsAndCategories(items) {
    try {
      const isSetupCompleted = await UtilitiesService.setupCompleted();
      if (isSetupCompleted) {
        throw new Error("Setup operation has already been completed");
      }

      const uniqueCategories = [...new Set(items.map((item) => item.category))];

      for (const categoryName of uniqueCategories) {
        let category = await db.Category.findOne({
          where: {
            category: categoryName,
          },
        });

        if (!category) {
          category = await db.Category.create({ category: categoryName });
        }
      }

      for (const item of items) {
        const category = await db.Category.findOne({
          where: {
            category: item.category,
          },
        });

        if (category) {
          let existingItem = await db.Item.findOne({
            where: {
              sku: item.sku,
            },
          });

          if (!existingItem) {
            await db.Item.create({
              categoryId: category.id,
              sku: item.sku,
              name: item.item_name,
              price: item.price,
              stock_quantity: item.stock_quantity,
              img_url: item.img_url,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async createRoles() {
    try {
      await db.Role.bulkCreate([
        {
          roleName: "Admin",
        },
        {
          roleName: "User",
        },
      ]);
      const adminRole = await db.Role.findOne({
        where: {
          roleName: "Admin",
        },
      });
      if (!adminRole) {
        throw new Error("Admin role does not exist");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error creating roles: " + error.message);
    }
  }

  static async createAdminUser() {
    try {
      const existingAdminCount = await db.User.count({
        include: [
          {
            model: db.Role,
            as: "Roles",
            where: {
              roleName: "Admin",
            },
          },
        ],
      });

      if (existingAdminCount > 0) {
        throw new Error("Admin user already exists");
      }

      await userService.createAdminUser(
        process.env.REQUIRED_ADMIN_USERNAME,
        process.env.REQUIRED_ADMIN_PASSWORD
      );
    } catch (error) {
      console.log(error);
      throw new Error("Error creating admin user: " + error.message);
    }
  }

  static async searchItemsByName(item_name) {
    return db.Item.findAll({
      where: {
        name: {
          [Op.like]: `%${item_name}%`,
        },
      },
    });
  }

  static async searchItemBySKU(sku) {
    return db.Item.findOne({
      where: {
        sku: sku,
      },
    });
  }

  static async searchCategoriesByName(category_name) {
    return db.Category.findAll({
      where: {
        category: {
          [Op.like]: `%${category_name}%`,
        },
      },
    });
  }

  static async searchItemsByNameAndCategory(item_name, categoryId) {
    return db.Item.findAll({
      where: {
        name: {
          [Op.like]: `%${item_name}%`,
        },
        categoryId: categoryId,
      },
    });
  }

  static async getItemsInCategory(categoryId) {
    return db.Item.findAll({
      where: {
        categoryId: categoryId,
      },
    });
  }
}

module.exports = UtilitiesService;
