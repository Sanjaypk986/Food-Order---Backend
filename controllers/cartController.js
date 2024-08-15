import { Cart } from "../models/cartModel.js";
import { Food } from "../models/foodModel.js";
import { User } from "../models/userModel.js";

export const addItem = async (req, res) => {
  try {
    // Destructure data from request body
    const { foodId, quantity } = req.body;

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

    // Find or create the cart for the user
    let cart = await Cart.findOne({ user: user._id }); // Use user._id 
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] }); // Pass user._id
    }

    // Check if the food item is already in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );
    if (itemIndex > -1) {
      return res.json({ message: "Item already in cart" });
    } else {
      cart.items.push({ food: foodId, quantity });
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

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
