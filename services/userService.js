const db = require("../models");
const jwt = require("jsonwebtoken");
const cartService = require("../services/cartService.js");
require("dotenv").config();

class UserService {
  static async updateUserDiscount(email) {
    const users = await db.User.findAll({ where: { email } });
    const discount =
      users.length >= 2 && users.length <= 4 ? users.length * 10 : 0;
    for (const user of users) {
      await user.update({ discount });
    }
  }

  static async createUser(data, role) {
    try {
      const sameEmailCount = await db.Email.count({
        where: { email: data.email },
      });
      if (sameEmailCount >= 4) {
        throw new Error("This email is already registered with 4 users");
      }

      const existingUser = await db.User.findOne({
        where: { username: data.username },
      });
      if (existingUser) {
        throw new Error("Username is already taken");
      }

      const user = await db.User.create({
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      await db.Email.create({ email: data.email, userId: user.id });

      let roleData = await db.Role.findOne({ where: { roleName: role } });
      if (!roleData) {
        roleData = await db.Role.create({ roleName: role });
      }

      await user.addRole(roleData);
      await UserService.updateUserDiscount(data.email);
      await cartService.createCart(user.id);
      await user.reload();

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async createAdminUser(username, password) {
    try {
      const existingAdminUser = await db.User.findOne({
        include: [
          {
            model: db.Role,
            as: "Roles",
            where: { roleName: "Admin" },
          },
        ],
      });

      if (existingAdminUser) {
        throw new Error("Admin user already exists");
      }

      const existingUser = await db.User.findOne({ where: { username } });
      if (existingUser) {
        throw new Error("Username is already taken");
      }

      const role = await db.Role.findOne({ where: { roleName: "Admin" } });
      if (!role) {
        throw new Error("Admin role does not exist");
      }

      const user = await db.User.create({
        fullname: process.env.REQUIRED_ADMIN_FULLNAME,
        username,
        password,
        email: process.env.REQUIRED_ADMIN_EMAIL,
      });

      await user.addRole(role);

      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async loginUser(data) {
    try {
      const user = await db.User.findOne({
        where: { username: data.username },
      });

      if (user && (await user.validPassword(data.password))) {
        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "2h",
        });
        return { token, user };
      }
      throw new Error("Invalid username or password");
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const user = await db.User.findOne({ where: { id }, include: [db.Role] });
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async getDiscount(email) {
    const count = await db.User.count({ where: { email: email } });
    if (count >= 2) return 0.1;
    if (count >= 3) return 0.3;
    if (count >= 4) return 0.4;
    return 0;
  }

  static async updateUser(id, data) {
    try {
      const user = await db.User.findOne({ where: { id } });
      if (!user) {
        throw new Error("User not found");
      }

      let isModified = false;

      if (data.username) {
        const existingUser = await db.User.findOne({
          where: { username: data.username },
        });
        if (existingUser && existingUser.id !== id) {
          throw new Error("Username is already taken");
        }
        user.username = data.username;
        isModified = true;
      }

      if (data.email) {
        const oldEmail = user.email;
        const sameEmailCount = await db.User.count({
          where: { email: data.email },
        });
        if (sameEmailCount >= 4 && user.email !== data.email) {
          throw new Error("This email is already registered with 4 users");
        }
        user.email = data.email;

        await UserService.updateUserDiscount(oldEmail);
        await UserService.updateUserDiscount(data.email);
        isModified = true;
      }

      if (data.password) {
        user.password = data.password;
        isModified = true;
      }

      if (isModified) {
        await user.save();
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const user = await db.User.findOne({ where: { id } });
      if (!user) {
        throw new Error("User not found");
      }

      const email = user.email;
      await user.destroy();

      await UserService.updateUserDiscount(email);

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
