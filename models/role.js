module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define("Role", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        roleName: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {timestamps: true});

    Role.associate = function (models) {
        Role.belongsToMany(models.User, {through: "user_roles"});
    };

    return Role;
};
