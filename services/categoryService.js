const db = require("../models");
const { Op } = require("sequelize");

class CategoryService {
  static async createCategory(categoryData) {
    try {
      const existingCategory = await db.Category.findOne({
        where: {
          category: categoryData.category,
        },
      });

      if (existingCategory) {
        throw new Error("Category already exists");
      }

      const category = await db.Category.create({
        category: categoryData.category,
      });
      return category;
    } catch (error) {
      throw error;
    }
  }

  static async createCategoryIfNotExists(categoryData) {
    try {
      let category = await db.Category.findOne({
        where: {
          category: categoryData.category,
        },
      });
      if (category) {
        throw new Error("Category already exists");
      }
      category = await this.createCategory(categoryData);
      return category;
    } catch (error) {
      throw error;
    }
  }

  static async searchCategoriesByName(category_name) {
    return db.Category.findAll({
      where: {
        category: {
          [Op.like]: "%" + category_name + "%",
        },
      },
    });
  }

  static async getCategories(role) {
    try {
      let categories;
      switch (role) {
        case "Admin":
        case "User":
        case "guest":
          categories = await db.Category.findAll();
          return categories;
        default:
          throw new Error(`Unsupported role: ${role}`);
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateCategory(id, newCategory) {
    try {
      const category = await db.Category.findByPk(id);
      if (!category) {
        throw new Error("Category not found");
      }
      return category.update({ category: newCategory });
    } catch (error) {
      throw error;
    }
  }

  static async deleteCategory(id) {
    try {
      const category = await db.Category.findByPk(id);
      if (!category) {
        throw new Error("Category not found");
      }
      const items = await category.getItems();
      if (items && items.length > 0) {
        throw new Error("Category has associated items");
      }

      return category.destroy();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CategoryService;
