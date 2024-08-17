import mongoose from "mongoose";
import { Cart } from "../models/cartModel.js";
import { Food } from "../models/foodModel.js";
import { User } from "../models/userModel.js";

// add items to crat
export const addItem = async (req, res) => {
  try {
    // Destructure data from request body
    const { foodId, quantity } = req.body;

    // Validate foodId
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid food ID" });
    }

    // Validate quantity, must be greater than 0
    if (quantity === undefined || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    // Get user information from auth middleware
    const userInfo = req.user;

    // Find user by email
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the food item by ID and populate its restaurant details
    const food = await Food.findById(foodId).populate({
      path: "restaurant",
      select: "-password -orders -email" 
    });;
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    // Find or create the cart for the user
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
    }

    // Check if the food item is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );
    if (itemIndex > -1) {
      return res.json({ message: "Item already in cart" });
    } else {
      // Add the food item and quantity to the cart
      cart.items.push({ food: food, quantity });
    }

    // Calculate total amount 
    let totalAmount = 0;
    for (const item of cart.items) {
      // Ensure the food item is populated
      const foodItem = await Food.findById(item.food);
      if (foodItem) {
        totalAmount += foodItem.price * item.quantity;
      }
    }

    // Save the updated total amount in the cart
    cart.total = totalAmount;
    await cart.save();

    // Send the updated cart as a response
    res.status(200).json({ success: true, cart });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ success: false, message: error.message });
  }
};

// remove an item from the cart
export const removeItemFromCart = async (req, res) => {
  try {
    // Destructure data from request body
    const { foodId } = req.body;

    // Validate foodId
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid food ID" });
    }
    // Get user information from auth middleware
    const userInfo = req.user;

    // Find user by email
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the food item
    const food = await Food.findById(foodId);
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }
    // Find the cart for the user
    let cart = await Cart.findOne({ user: user._id }); // Use user._id
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    // Check if the food item exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }
    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);
    // Calculate the total price of the cart
    const itemIds = cart.items.map((item) => item.food); // Get all foodIds in cart
    const foodItems = await Food.find({ _id: { $in: itemIds } }); // Get price list of all food items

    // Create a map of food prices
    const priceMap = foodItems.reduce((map, item) => {
      map[item._id.toString()] = item.price;
      return map;
    }, {});

    // Calculate the total price
    let totalPrice = 0;
    cart.items.forEach((item) => {
      const price = priceMap[item.food.toString()];
      totalPrice += item.quantity * (price || 0);
    });

    // Save the updated cart
    cart.total = totalPrice;
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Removed item successfully", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//   update the quantity of an item in the cart
export const updateItemQuantity = async (req, res) => {
  try {
    // Destructure data from request body
    const { foodId, quantity } = req.body;

    // Validate foodId
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid food ID" });
    }
    // Validate quantity
    if (quantity === undefined || quantity < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    // Get user information from auth middleware
    const userInfo = req.user;

    // Find user by email
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the food item
    const food = await Food.findById(foodId);
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }
    let cart = await Cart.findOne({ user: user._id }); // Use user._id
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    // Check if the food item exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }
    // update quantity
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1); // Remove item if quantity is 0 or less
    } else {
      cart.items[itemIndex].quantity = quantity; // Update quantity
    }
    // Calculate the total price of the cart
    const itemIds = cart.items.map((item) => item.food); // Get all foodIds in cart
    const foodItems = await Food.find({ _id: { $in: itemIds } }); // Get price list of all food items

    // Create a map of food prices
    const priceMap = foodItems.reduce((map, item) => {
      map[item._id.toString()] = item.price;
      return map;
    }, {});

    // Calculate the total price
    let totalPrice = 0;
    cart.items.forEach((item) => {
      const price = priceMap[item.food.toString()];
      totalPrice += item.quantity * (price || 0);
    });

    // Save the updated cart
    cart.total = totalPrice;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item quantity updated successfully",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//   get cart details
export const getCartDetails = async (req, res) => {
  try {
    // Get user information from auth middleware
    const userInfo = req.user;

    // Find user by email
    const user = await User.findOne({ email: userInfo.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the cart for the user
    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.food",
      populate: {
        path: "restaurant",
        model: "Restaurant",
        select: "-password -orders -email" 
      },
    });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
     // Calculate total amount 
     let totalAmount = 0;
     cart.items.forEach(item => {
       totalAmount += item.food.price * item.quantity;
     });
 
     cart.total = totalAmount;

    // Return cart details
    res.status(200).json({
      success: true,
      message: "Cart details fetched",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
