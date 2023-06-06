const jwt = require("jsonwebtoken");
const db = require("../models");

async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        req.user = {
            role: "guest"
        };
        return next();
    }

    if (token) {
        try {
            const user = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(user);
                });
            });

            const dbUser = await db.User.findByPk(user.id, {
                include: [
                    {
                        model: db.Role
                    }
                ]
            });
            if (dbUser) {
                const userRoles = dbUser.Roles.map((role) => role.roleName);
                const userRole = userRoles.includes("Admin") ? "Admin" : "User";
                req.user = {
                    ... dbUser.toJSON(),
                    role: userRole
                };
            } else {
                req.user = {
                    role: "guest"
                };
            }
        } catch (err) {
            req.user = {
                role: "guest"
            };
        }
    } else {} next();
}

function registeredOnly(req, res, next) {
    if (! req.user || req.user.role === "guest") {
        return res.status(403).json({message: "Unauthorized Access"});
    }
    next();
}

function adminOnly(req, res, next) {
    if (! req.user || req.user.role !== "Admin") {
        return res.status(403).json({message: "Unauthorized Access"});
    }
    next();
}

module.exports = {
    authenticateToken,
    registeredOnly,
    adminOnly
};
