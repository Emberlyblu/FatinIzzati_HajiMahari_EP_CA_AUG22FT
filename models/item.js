module.exports = (sequelize, Sequelize) => {
    const Item = sequelize.define("Item", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        categoryId: {
            type: Sequelize.INTEGER,
            references: {
                model: "categories",
                key: "id"
            },
            allowNull: false
        },
        sku: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        stock_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        img_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        }
    });

    Item.associate = (models) => {
        Item.belongsTo(models.Category, {
            foreignKey: "categoryId",
            as: "Category"
        });
        Item.belongsToMany(models.Cart, {
            through: "CartItem",
            foreignKey: "itemId",
            otherKey: "cartId"
        });
        Item.belongsToMany(models.Order, {
            through: "OrderItem",
            foreignKey: "itemId",
            otherKey: "orderId"
        });
    };

    return Item;
};
