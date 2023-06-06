require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var Middleware = require("./middleware/authMiddlewares");

var utilitiesRouter = require("./routes/utilities");
var itemsRouter = require("./routes/items");
var categoriesRouter = require("./routes/categories");
var authenticationRouter = require("./routes/authentication");
var itemRouter = require("./routes/item");
var categoryRouter = require("./routes/category");
var allcartsRouter = require("./routes/allcarts");
var cartRouter = require("./routes/cart");
var cartItemRouter = require("./routes/cartItem");
var allordersRouter = require("./routes/allOrders");
var ordersRouter = require("./routes/orders");
var orderRouter = require("./routes/order");

var db = require("./models");

db.sequelize.sync({force: false }).catch((err) => console.error("Unable to connect to the database:", err));

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(Middleware.authenticateToken);


app.use("/", utilitiesRouter);
app.use("/items", itemsRouter);
app.use("/categories", categoriesRouter);
app.use("/cart", cartRouter);
app.use("/cart_item", cartItemRouter);
app.use("/orders", ordersRouter);
app.use("/order", orderRouter);
app.use("/allcarts", allcartsRouter);
app.use("/allorders", allordersRouter);
app.use("/", authenticationRouter);
app.use("/item", itemRouter);
app.use("/category", categoryRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) { 
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
