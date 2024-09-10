import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import twilio from "twilio";

// twillio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// create order
export const createOrder = async (req, res) => {
  try {
    const user = req.user;

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

    // Assume the cart total has been updated with any applied discount
    const updatedCartTotal = cart.total;

    // Group cart items by restaurant
    const itemsByRestaurant = cart.items.reduce((acc, item) => {
      const restaurantId = item.food.restaurant.toString();
      if (!acc[restaurantId]) {
        acc[restaurantId] = [];
      }
      acc[restaurantId].push(item);
      return acc;
    }, {});

    // Calculate the discounted total for each restaurant
    const orders = [];
    for (const restaurantId in itemsByRestaurant) {
      const items = itemsByRestaurant[restaurantId];

      if (items.length === 0) continue; // Skip empty item lists

      // Validate and calculate the total for the restaurant's order
      let restaurantTotal = 0;
      const validatedItems = items.map((item) => {
        const price = item.food.price;
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
        restaurantTotal += price * item.quantity;
        return {
          food: item.food,
          quantity: item.quantity,
          price: price,
        };
      });

      // Set the order total using the updated cart total divided by restaurants
      const newOrder = new Order({
        user: user._id,
        restaurant: restaurantId,
        items: validatedItems,
        total: updatedCartTotal / Object.keys(itemsByRestaurant).length, // Distribute the discount proportionally
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
    // // Send order confirmation SMS
    const message = await client.messages.create({
      body: `Hello ${user.name},\n\nYour order with ID ${orders[0]._id} has been successfully placed with Spicezy! Thank you for choosing us. We are excited to prepare your delicious meal and will keep you updated on the status of your order.\n\nIf you have any questions or need further assistance, feel free to contact us.\n\nBest regards,\nThe Spicezy Team`,
      
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: user.mobile,
    });
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
    const order = await Order.findById(orderId)
      .populate({
        path: "restaurant",
        select: "-password -orders -email", // Exclude fields like password, orders, and email
      })
      .populate({
        path: "food",
      });
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

// get all orders by user
export const myOrders = async (req, res) => {
  try {
    // get from auth user
    const user = req.user;

    if (!user) {
      return res
        .status(404)
        .json({ sucess: false, message: " user not found" });
    }

    // find orders by user ID
    const orders = await Order.find({ user: user._id })
      .populate({
        path: "restaurant",
        select: "-password -orders -email", // Exclude fields like password, orders, and email
      })
      .populate({
        path: "items.food", // Populate the food inside items
      });
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }
    res.status(200).json({
      success: true,
      message: "my order fetched  successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
