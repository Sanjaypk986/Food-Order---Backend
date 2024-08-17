import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";

// create order
export const createOrder = async (req, res) => {
  try {
    const userInfo = req.user;
    const user = await User.findOne({ email: userInfo.email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.food",
      select: "price restaurant",
    });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Group cart items by restaurant
    const itemsByRestaurant = cart.items.reduce((acc, item) => {
      const restaurantId = item.food.restaurant.toString();
      if (!acc[restaurantId]) {
        acc[restaurantId] = [];
      }
      acc[restaurantId].push(item);
      return acc;
    }, {});

    // Create orders for each restaurant
    const orders = [];
    for (const restaurantId in itemsByRestaurant) {
      const items = itemsByRestaurant[restaurantId];

      if (items.length === 0) continue; // Skip empty item lists

      // Validate and calculate total
      let total = 0;
      const validatedItems = items.map((item) => {
        const price = item.food.price; // Access price directly
        if (
          isNaN(price) ||
          price <= 0 ||
          isNaN(item.quantity) ||
          item.quantity <= 0
        ) {
          console.error(
            `Invalid item - Price: ${price}, Quantity: ${item.quantity}`
          );
          throw new Error("Invalid item price or quantity");
        }
        total += price * item.quantity;
        return {
          food: item.food,
          quantity: item.quantity,
          price: price,
        };
      });

      const newOrder = new Order({
        user: user._id,
        restaurant: restaurantId,
        items: validatedItems,
        total: total,
      });

      await newOrder.save();

      const restaurant = await Restaurant.findById(restaurantId);
      if (restaurant) {
        restaurant.orders.push(newOrder._id);
        await restaurant.save();
      }

      user.orders.push(newOrder._id);
      orders.push(newOrder);
    }

    // Clear the cart
    await Cart.deleteOne({ _id: cart._id });
    await user.save();

    res.status(200).json({
      success: true,
      message: "Orders created successfully",
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get orderby id
export const getOrderById = async (req, res) => {
  try {
    // destructure order id
    const { orderId } = req.params;

    // find order
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "order details fetched", order: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// cancel order
export const cancelOrder = async (req, res) => {
  try {
    // desturcture order id
    const { orderId } = req.params;

    // find order
    const order = await Order.findById(orderId);
    if (!orderId) {
      return res
        .status(404)
        .json({ sucess: false, message: " Order not found" });
    }
    if (order.status === "Delivered" || order.status === "Confirmed") {
      return res
        .status(404)
        .json({ sucess: false, message: " Cannot cancel the order" });
    }
    // change status to canceled
    order.status = "Cancelled";
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "order cancel successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
