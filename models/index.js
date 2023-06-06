const Sequelize = require("sequelize");
const path = require("path");
require("dotenv").config();

const connection = {
    database: process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_NAME : process.env.DATABASE_NAME,
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    dialect: process.env.DIALECT,
    dialectmodule: process.env.DIALECTMODULE,
    logging: false
};
const sequelize = new Sequelize(connection);
const db = {};
db.sequelize = sequelize;

const modelFiles = [
    "Category",
    "Item",
    "User",
    "Cart",
    "CartItem",
    "Order",
    "OrderItem",
    "Role",
    "Email",
];

modelFiles.forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
