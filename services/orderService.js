const db = require("../models");

class OrderServices {
  static async getOrders(userId) {
    const user = await db.User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const orders = await db.Order.findAll({
      where: {
        userId: userId,
        status: "Completed",
      },
      include: {
        model: db.OrderItem,
        as: "orderItems",
        include: {
          model: db.Item,
          as: "Item",
        },
      },
    });

    return orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      discount: user.discount,
      total: order.total,
      items: order.orderItems.map((orderItem) => ({
        itemId: orderItem.Item.id,
        name: orderItem.Item.name,
        category: orderItem.Item.categoryId,
        quantity: orderItem.quantity,
        price: orderItem.price,
        imageUrl: orderItem.Item.img_url,
      })),
    }));
  }

  static async getAllOrders() {
    const query = `
            SELECT 
                orders.id as orderId,
                orders.total,
                orders.status,
                orders.createdAt,
                orders.updatedAt,
                users.fullname as fullname,
                users.username as username,
                users.email as user_email,
                users.discount as user_discount,
                orderItems.itemId as itemId,
                items.name as itemName,
                items.price as itemPrice,
                items.sku as itemSKU,
                orderItems.quantity as quantity
            FROM 
                orders 
            LEFT JOIN 
                users on orders.userId = users.id
            LEFT JOIN
                orderItems on orders.id = orderItems.orderId
            LEFT JOIN
                items on orderItems.itemId = items.id
        `;
    const dbResponse = await db.sequelize.query(query, {
      type: db.sequelize.QueryTypes.SELECT,
    });

    const orderIds = [...new Set(dbResponse.map((order) => order.orderId))];

    const response = orderIds.map((orderId) => {
      const orderInfo = dbResponse.find((order) => order.orderId === orderId);
      const items = dbResponse
        .filter((order) => order.orderId === orderId)
        .map((order) => ({
          itemId: order.itemId,
          name: order.itemName,
          description: order.itemDescription,
          price: order.itemPrice,
          SKU: order.itemSKU,
          quantity: order.quantity,
        }));

      return {
        orderId: orderInfo.orderId,
        total: orderInfo.total,
        status: orderInfo.status,
        createdAt: orderInfo.createdAt,
        updatedAt: orderInfo.updatedAt,
        fullname: orderInfo.fullname,
        userName: orderInfo.username,
        userEmail: orderInfo.user_email,
        userDiscount: orderInfo.user_discount,
        items,
      };
    });

    return response;
  }

  static async placeOrder(userId, cartId) {
    const t = await db.sequelize.transaction();
    try {
      const user = await db.User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const cart = await db.Cart.findOne({
        where: {
          id: cartId,
          userId: userId,
        },
        include: db.Item,
      });
      if (!cart) {
        throw new Error("Cart not found");
      }
      const discount = user.discount;
      const order = await db.Order.create(
        {
          userId: userId,
          total: 0,
          status: "In Progress",
        },
        { transaction: t }
      );

      let total = 0;
      const cartItems = await cart.getItems();

      if (cartItems.length === 0) {
        return { error: "You cart is currently empty" };
      }

      const itemsInOrder = [];
      for (let item of cartItems) {
        const quantity = item.CartItem.quantity;
        if (item.stock_quantity < quantity)
          throw new Error("Not enough stock for item " + item.id);

        item.stock_quantity -= quantity;
        await item.save({ transaction: t });
        total += item.price * quantity;

        await db.OrderItem.create(
          {
            orderId: order.id,
            itemId: item.id,
            quantity: quantity,
            price: item.price,
          },
          { transaction: t }
        );

        itemsInOrder.push({
          itemId: item.id,
          name: item.name,
          quantity: quantity,
          price: item.price,
        });
      }

      // discount
      const discountedTotal = parseFloat(
        (total * (1 - discount / 100)).toFixed(2)
      );
      await order.update(
        {
          total: discountedTotal,
        },
        { transaction: t }
      );

      // Empty cart after placing the order
      await cart.setItems([], { transaction: t });

      await t.commit();

      return {
        message: "Congratulations! You've successfully placed your order",
        orderId: order.id,
        status: order.status,
        discount: discount,
        YourTotalBeforeDiscount: total,
        YourTotalAfterDiscount: discountedTotal,

        items: itemsInOrder,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async updateOrderStatus(orderId, status) {
    const validStatuses = ["In Process", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of ${validStatuses.join(", ")}`
      );
    }
    const order = await db.Order.findByPk(orderId);
    if (!order) throw new Error("Order not found");

    return order.update({ status: status });
  }
}

module.exports = OrderServices;
