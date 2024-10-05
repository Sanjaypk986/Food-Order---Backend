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

    // Use the cart total (which could include discounts)
    const updatedCartTotal = cart.total;

    // Group cart items by restaurant
    const itemsByRestaurant = cart.items.reduce((acc, item) => {
      //create grouping with restaurant
      const restaurantId = item.food.restaurant.toString(); //assigned restaurantId (this is key for grouping)
      if (!acc[restaurantId]) {
        //checking our acc already have that restaurant
        acc[restaurantId] = []; //if not create a empty array
      }
      acc[restaurantId].push(item); //push item o restaurant
      return acc; //return updated acc
    }, {});

    const restaurantOrders = []; // creating a empty array for storing orders

    // Create a single order with multiple restaurant entries
    for (const restaurantId in itemsByRestaurant) {
      //for loop for getting all restaurantId from  itemsByRestaurant
      const items = itemsByRestaurant[restaurantId]; //storing restuarntId

      if (items.length === 0) continue; // empty item lists condition (continue work as return)

      // Validate and calculate the total for each restaurant's order
      let restaurantTotal = 0;
      const validatedItems = items.map((item) => {
        const price = item.food.price; //store food price
        if (
          //check price and quantity condition
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
        restaurantTotal += price * item.quantity; //calculate restaurant total
        return {
          food: item.food,
          quantity: item.quantity,
          price: price,
        };
      });

      // Add restaurant order to the main order
      restaurantOrders.push({
        restaurant: restaurantId,
        items: validatedItems,
        restaurantTotal: restaurantTotal, // Each restaurant keeps its actual total
      });
    }

    // Create the single order with the cart total
    const newOrder = new Order({
      user: user._id,
      restaurants: restaurantOrders,
      total: updatedCartTotal, // Use the cart total for the overall order total
    });

    await newOrder.save();

    // Update restaurant and user orders
    for (const restaurantId in itemsByRestaurant) {
      const restaurant = await Restaurant.findById(restaurantId); //find restaurant using restaurantId
      if (restaurant) {
        restaurant.orders.push(newOrder._id); //push order to restaurant array
        await restaurant.save();
      }
    }

    user.orders.push(newOrder._id); //order pushed to users orders array
    await user.save();

    // Clear the cart
    const deleteCartResult = await Cart.deleteOne({ _id: cart._id }); //after order creating delete cart items

    // Send order confirmation SMS
    const message = await client.messages.create({
      body: `Hello ${user.name},\n\nYour order with ID ${newOrder._id} has been successfully placed with Spicezy! Thank you for choosing us.`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: user.mobile,
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
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

// cancel order by restaurant
export const cancelOrder = async (req, res) => {
  try {
    // Destructure orderId and restaurantId from request params
    const { orderId, restaurantId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Find the specific restaurant order
    const restaurantOrder = order.restaurants.find(
      //find method loops restaurant single object
      (r) => r.restaurant.toString() === restaurantId // find restaurant that same as restaurantId
    );
    if (!restaurantOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant order not found" });
    }

    // Check if the restaurant order status can be changed
    if (
      restaurantOrder.status === "Delivered" ||
      restaurantOrder.status === "Confirmed"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a confirmed or delivered order",
      });
    }

    // Update the restaurant order status to cancelled
    restaurantOrder.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Restaurant order cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// all order cancel
export const cancelCompleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if the main order status allows cancellation
    if (order.status === "Delivered" || order.status === "Confirmed") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel the entire order" });
    }

    //  determine if the main order can be cancelled
    let allCancelled = true;
    let allRestaurantOrdersDeliveredOrConfirmed = true;

    // Check and update each restaurant order within the main order
    for (let restaurantOrder of order.restaurants) {
      if (
        restaurantOrder.status === "Delivered" ||
        restaurantOrder.status === "Confirmed"
      ) {
        allCancelled = false; // At least one restaurant order is not cancelled
      } else if (restaurantOrder.status !== "Cancelled") {
        // Update the restaurant order status to cancelled if not already cancelled
        restaurantOrder.status = "Cancelled";
      } else {
        allCancelled = false; // If any restaurant order is not "Cancelled", set to false
      }

      // Check if all restaurant orders are either delivered or confirmed
      if (
        restaurantOrder.status !== "Delivered" &&
        restaurantOrder.status !== "Confirmed"
      ) {
        allRestaurantOrdersDeliveredOrConfirmed = false;
      }
    }

    // If all restaurant orders are cancelled, set the main order status to cancelled
    if (allCancelled) {
      order.status = "Cancelled";
    } else if (allRestaurantOrdersDeliveredOrConfirmed) {
      // If all restaurant orders are delivered or confirmed, update the main order status to "Delivered"
      order.status = "Delivered";
    }

    // Save the updated order
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order and restaurant orders updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all orders by user
export const myOrders = async (req, res) => {
  try {
    // Get the user from the request (auth)
    const user = req.user;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find orders by user ID and populate restaurants and items
    const orders = await Order.find({ user: user._id })
      .populate({
        path: "restaurants.restaurant", // Populate each restaurant in the order
        select: "-password -orders -email", // remove fields
      })
      .populate({
        path: "restaurants.items.food", // Populate the food inside each restaurant's items
        select: "name price image", // Select the required food fields
      });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      message: "My orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatusBasedOnRestaurants = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const allPending = order.restaurants.every(
      (rest) => rest.status === "Pending"
    );
    // Check the status of all restaurants in the order
    const allDelivered = order.restaurants.every(
      (rest) => rest.status === "Delivered"
    );

    const allConfirmed = order.restaurants.every(
      (rest) => rest.status === "Confirmed" || rest.status === "Delivered"
    );

    // If all restaurants have "Pending" status, set order status to "Pending"
    if (allPending) {
      order.status = "Pending";
    }
    if (allDelivered) {
      order.status = "Delivered";
    } else if (allConfirmed) {
      order.status = "Confirmed";
    }

    // Save the updated order status
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated based on restaurant statuses`,
      data: order,
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};
