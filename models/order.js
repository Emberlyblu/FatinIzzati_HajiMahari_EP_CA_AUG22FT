module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("Order", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        total: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "active"
        }
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user"
        });
        Order.hasMany(models.OrderItem, {
            foreignKey: "orderId",
            as: "orderItems"
        });
    };

    return Order;
};
