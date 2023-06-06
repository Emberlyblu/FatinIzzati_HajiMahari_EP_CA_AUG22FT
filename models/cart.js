module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define("Cart", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "active"
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        }
    });

    Cart.associate = (models) => {
        Cart.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
            unique: true
        });
        Cart.hasMany(models.CartItem, {
            foreignKey: "cartId",
            as: "cartItems"
        });
        Cart.belongsToMany(models.Item, {
            through: "CartItem",
            foreignKey: "cartId",
            otherKey: "itemId"
        });
    };

    return Cart;
};
