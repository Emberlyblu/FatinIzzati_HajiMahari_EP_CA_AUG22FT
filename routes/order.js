const express = require("express");
const router = express.Router();
const {registeredOnly, adminOnly} = require("../middleware/authMiddlewares.js");
const orderServices = require("../services/orderService.js");
const {body, param, validationResult} = require("express-validator");


/** Create order endpoint**/
router.post("/:id", registeredOnly, 
[
    param("id").isInt().withMessage("Order Id must be an integer")
], 
async (req, res, next) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const newOrder = await orderServices.placeOrder(req.user.id, req.params.id);
        res.status(201).json(newOrder);
    } catch (error) {
        if (error.message === "This order has already been placed" || error.message === "Your cart is currently empty") {
            res.status(400).json({message: error.message});
        } else {
            res.status(500).json({message: "An error occurred on the server"});
        }
    }
});


/** Update order status endpoint**/
router.put("/:id", adminOnly, 
[
    body("status").isIn(["In Progress", "Completed", "Cancelled"]).withMessage("Invalid status"),
], 
async (req, res, next) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        await orderServices.updateOrderStatus(req.params.id, req.body.status);
        res.status(200).send("Order status has been updated successfully");
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;
