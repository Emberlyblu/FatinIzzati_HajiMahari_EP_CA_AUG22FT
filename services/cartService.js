const db = require("../models");

class CartServices {
  static async createCart(userId) {
    try {
      const cart = await db.Cart.create({ userId });
      return cart;
    } catch (error) {
      throw error;
    }
  }

  static async getCart(userId) {
    return db.Cart.findOne({
      where: {
        UserId: userId,
      },
      attributes: {
        exclude: ["status", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: db.Item,
          attributes: {
            exclude: ["stock_quantity", "createdAt", "updatedAt"],
          },
          through: {
            model: db.CartItem,
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        },
      ],
    });
  }

  static async getAllCarts() {
    const query = `
          SELECT Carts.id AS cartId, 
          Users.id AS userId, Users.fullname, Users.username, Emails.email, 
          Items.id AS itemId, Items.name, CartItems.quantity
          FROM Carts
          INNER JOIN Users ON Carts.userId = Users.id
          INNER JOIN Emails ON Users.id = Emails.userId
          INNER JOIN CartItems ON Carts.id = CartItems.cartId
          INNER JOIN Items ON CartItems.itemId = Items.id
        `;

    const rows = await db.sequelize.query(query, {
      type: db.sequelize.QueryTypes.SELECT,
    });

    const carts = {};

    for (const row of rows) {
      const {
        userId,
        username,
        fullname,
        email,
        cartId,
        name,
        itemId,
        quantity,
      } = row;

      if (!carts[userId]) {
        carts[userId] = {
          id: userId,
          username,
          fullname,
          email,
          cartId,
          items: [],
        };
      }

      carts[userId].items.push({ id: itemId, name, quantity });
    }
    return Object.values(carts);
  }

  static async addItemToCart(userId, itemId, quantity) {
    const item = await db.Item.findOne({
      where: {
        id: itemId,
      },
    });
    if (!item) throw new Error("Item not found");

    if (item.stock_quantity < quantity)
      throw new Error("Not enough stock for this item");

    const cart = await db.Cart.findOne({
      where: {
        UserId: userId,
      },
    });
    const existingCartItem = await db.CartItem.findOne({
      where: {
        cartId: cart.id,
        itemId: itemId,
      },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      existingCartItem.currentPrice = item.price;
      await existingCartItem.save();
    } else {
      await cart.addItem(item, {
        through: {
          quantity: quantity,
          originalPrice: item.price,
          currentPrice: item.price,
        },
      });
    }
  }

  static async updateCartItem(cartItemId, quantity, userId) {
    const cartItem = await db.CartItem.findOne({
      where: {
        id: cartItemId,
      },
      include: [
        {
          model: db.Item,
          as: "Item",
        },
        {
          model: db.Cart,
          as: "cart",
        },
      ],
    });

    if (!cartItem) throw new Error("Cart item not found");

    if (!cartItem.cart) {
      throw new Error("Cart not found for this cart item");
    }

    if (cartItem.cart.userId !== userId)
      throw new Error("User not authorized to modify this cart item");

    if (cartItem.Item.stock_quantity < quantity)
      throw new Error("Not enough stock for this item");

    return cartItem.update({ quantity: quantity });
  }

  static async removeCartItem(userId, cartItemId) {
    const cartItem = await db.CartItem.findOne({
      where: {
        id: cartItemId,
      },
      include: [
        {
          model: db.Cart,
          as: "cart",
        },
      ],
    });
    if (!cartItem) {
      throw new Error("Cannot find this cart item");
    }
    if (!cartItem.cart || cartItem.cart.userId !== userId) {
      throw new Error("User not authorized to modify this cart item");
    }
    await cartItem.destroy();
  }

  static async emptyCart(cartId, userId) {
    const cart = await db.Cart.findOne({
      where: {
        id: cartId,
      },
    });
    if (!cart) {
      throw new Error("Cart not found");
    }
    if (cart.userId !== userId) {
      throw new Error("Unauthorized to empty this cart");
    }
    return cart.setItems([]);
  }
}

module.exports = CartServices;
