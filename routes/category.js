const express = require("express");
const router = express.Router();
const categoryServices = require("../services/categoryService.js");
const {adminOnly} = require("../middleware/authMiddlewares.js");
const {body, validationResult} = require("express-validator");


/** Create category endpoint**/
router.post("/", adminOnly, 
[
    body("category").isString().withMessage("Name must be a string")
], 
async (req, res, next) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const category = await categoryServices.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        if (error.message === "Category already exists") {
            res.status(400).json({message: error.message});
        } else {
            next(error);
        }
    }
});

/** Update category endpoint**/
router.put("/:id", adminOnly, 
[
    body("category").isString().withMessage("Name must be a string")
], 
async (req, res, next) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        await categoryServices.updateCategory(req.params.id, req.body.category);
        res.status(200).send("Category updated successfully");
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({message: error.message});
        }
        res.status(500).json({message: "An error occurred during category update"});
    }
});


/** Remove category endpoint**/
router.delete("/:id", adminOnly, async (req, res, next) => {
    try {
        await categoryServices.deleteCategory(req.params.id);
        res.status(200).send("Category deleted successfully");
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({message: error.message});
        }
        if (error.message.includes("associated items")) {
            return res.status(400).json({message: error.message});
        }
        res.status(500).json({message: "An error occurred during category deletion"});
    }
});

module.exports = router;
