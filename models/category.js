module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("Category", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        category: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    Category.associate = (models) => {
        Category.hasMany(models.Item, {
            foreignKey: "categoryId",
            as: "Items"
        });
    };

    return Category;
};
