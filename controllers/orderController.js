import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";

// create order
export const createOrder = async (req, res) => {
  try {
    // get user from authUser
    const userInfo = req.user;

    // find user
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      res.status(400).json({ message: "user not found" });
    }
    // find cart using user
    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.food",
      select: "restaurant",
    });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    // order already exists 
    const orderExists = await Order.findOne({cart:cart._id})
    if (orderExists) {
        return res.status(400).json({success:false, message:"order already placed"})
    }

    // create new order
    const newOrder = new Order({
      cart: cart,
    });
    // save newOrder
    await newOrder.save();
    // Extract the restaurant ID from the cart items
    const restaurantId = cart.items[0].food.restaurant;

    // find seller of the restaurant
    const restaurant = await Restaurant.findById(restaurantId );
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "restaurant not found" });
    }
    // Add the new order to the restaurant
    restaurant.orders.push(newOrder._id);
    await restaurant.save();

    // add orders list to user 
    user.orders.push(newOrder._id)
    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Order created successfully",
        order: newOrder,
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
    const order = await Order.findById(orderId).populate("cart");
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
