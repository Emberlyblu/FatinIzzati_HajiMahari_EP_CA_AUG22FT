module.exports = (sequelize, Sequelize) => {
    const Email = sequelize.define("Email", {
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: "Users",
                key: "id"
            }
        }
    }, {timestamps: true});

    Email.associate = function (models) {
        Email.belongsTo(models.User, {foreignKey: "userId"});
    };

    return Email;
};
