module.exports = (sequelize, Sequelize) => {
    const OrderItem = sequelize.define("OrderItem", {
        itemId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        orderId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
            foreignKey: "orderId",
            as: "order"
        });
        OrderItem.belongsTo(models.Item, {
            foreignKey: "itemId",
            as: "Item"
        });
    };

    return OrderItem;
};
