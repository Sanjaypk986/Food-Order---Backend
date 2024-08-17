import { Cart } from "../models/cartModel.js";
import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";

export const createOrder = async (req, res) => {
  try {
    // get user from authUser
    const userInfo = req.user;
    
    // find user 
    const user = await User.findOne({email:userInfo.email})
    if (!user) {
        res.status(400).json({message:"user not found"})
    }
    // find cart using user
    const cart = await Cart.findOne({user: user._id});
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    // create new order
    const newOrder = new Order({
      cart: cart._id,
    });
    // save newOrder
    await newOrder.save();

    res
      .status(200)
      .json({ success: true, message: "Order created successfully" ,order:newOrder});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
