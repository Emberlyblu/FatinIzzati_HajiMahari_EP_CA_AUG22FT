const express = require("express");
const router = express.Router();
const UserService = require("../services/userService");
const {body, validationResult} = require("express-validator");
const {registeredOnly} = require("../middleware/authMiddlewares");


/** Signup endpoint for new user registration*/
router.post("/signup", 
[
    body("fullname").isLength({min: 5}).withMessage("Fullname is required"),
    body("username").isLength({min: 5}).withMessage("Username must be at least 5 characters long"),
    body("password").isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    body("email").isEmail().withMessage("Email is not valid"),
], 
  async (req, res) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const result = await UserService.createUser(req.body, "User");
        res.status(201).json(result);
    } catch (err) {
        if (err.message === "Username is already taken") {
            return res.status(400).json({message: err.message});
        }
        if (err.message === "This email is already registered with 4 users") {
            return res.status(400).json({message: err.message});
        }
        res.status(500).json({message: "An error occurred during signup"});
    }
});


/** login endpoint for user login*/
router.post("/login", 
[
    body("username").exists().withMessage("Username is required").trim(), 
    body("password").exists().withMessage("Password is required").trim(),
],
 async (req, res) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
        req.body.username = req.body.username.trim();
        req.body.password = req.body.password.trim();

        const {token, user} = await UserService.loginUser(req.body);
        res.status(200).json({token, user});
    } catch (err) {
        if (err.message === "Invalid username or password") {
            return res.status(400).json({message: err.message});
        }
        res.status(500).json({message: "An error occurred during login"});
    }
});


/** Fetching a user endpoint for user & Admin*/
router.get("/:id", registeredOnly, async (req, res) => {
    if (req.user.role !== "Admin" && req.user.id !== Number(req.params.id)) {
        return res.status(403).json({message: "Unauthorized Access"});
    }

    try {
        const user = await UserService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


/** Updating a user endpoint*/
router.put("/:id", registeredOnly,
[
  body("fullname").optional().isLength({min: 5}).withMessage("fullname must be at least 5 characters long"),
  body("username").optional().isLength({min: 5}).withMessage("Username must be at least 5 characters long"),
  body("password").optional().isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
  body("email").optional().isEmail().withMessage("Email is not valid"),
],
 async (req, res) => {
    if (req.user.role !== "Admin" && req.user.id !== Number(req.params.id)) {
        return res.status(403).json({message: "Unauthorized Access"});
    }
    try {
        const updatedUser = await UserService.updateUser(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


/** Deleting a registered user endpoint*/
router.delete("/:id", registeredOnly, async (req, res) => {
    if (req.user.role !== "Admin" && req.user.id !== Number(req.params.id)) {
        return res.status(403).json({message: "Unauthorized Access"});
    }
    try {
        await UserService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;
