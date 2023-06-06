const bcrypt = require("bcrypt");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        fullname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        discount: {
            type: Sequelize.FLOAT,
            defaultValue: 0
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                const saltRounds = 10;
                user.password = await bcrypt.hash(user.password, saltRounds);
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    const saltRounds = 10;
                    user.password = await bcrypt.hash(user.password, saltRounds);
                }
            }
        }
    });

    User.associate = function (models) {
        User.belongsToMany(models.Role, {through: "user_roles"});
        User.hasOne(models.Cart, {
            foreignKey: "userId",
            as: "cart"
        });
        User.hasMany(models.Email, {foreignKey: "userId"});
    };

    User.prototype.validPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};
