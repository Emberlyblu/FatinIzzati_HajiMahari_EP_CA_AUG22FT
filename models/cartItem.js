module.exports = (sequelize, Sequelize) => {
    const CartItem = sequelize.define("CartItem", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        itemId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        cartId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
            allowNull: false
        }
    });

    CartItem.associate = (models) => {
        CartItem.belongsTo(models.Cart, {
            foreignKey: "cartId",
            as: "cart"
        });
        CartItem.belongsTo(models.Item, {
            foreignKey: "itemId",
            as: "Item"
        });
    };

    return CartItem;
};
