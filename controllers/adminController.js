import { Admin } from "../models/adminModel.js";
import { Order } from "../models/orderModel.js";
import { Restaurant } from "../models/restaurantModel.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

// create admin
export const adminCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, email, password } = req.body;
    // validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check admin available
    const adminExist = await Admin.findOne({ email });
    if (adminExist) {
      return res
        .status(400)
        .json({ success: false, message: "admin already exist" });
    }
    // password hashing
    const salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    // save admin
    await newAdmin.save();
    // to remove password from response
    const adminResponse = await Admin.findById(newAdmin._id).select(
      "-password"
    );
    //   authentication using jwt token
    const token = generateToken(email, "admin");
    //   send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    //   send success response
    res.status(200).json({
      success: true,
      message: "Admin created successfully",
      data: adminResponse,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// login admin
export const loginAdmin = async (req, res) => {
  try {
    // destructure values from req.body
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check admin available
    const adminExist = await Admin.findOne({ email });
    if (!adminExist) {
      return res
        .status(401)
        .json({ success: false, message: "admin does not exist" });
    }
    //  check pasword
    const passwordMatch = bcrypt.compareSync(password, adminExist.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "unauthoraized admin or invalid password",
      });
    }
    //   authentication using jwt token
    const token = generateToken(email, "admin");
    //   send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    //   send success response
    res
      .status(200)
      .json({ success: true, message: "Admin login successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// logout admin
export const logoutAdmin = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res
      .status(200)
      .json({ success: true, message: "Admin logout successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// check admin
export const checkAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "admin not authoraized" });
    }
    res.status(200).json({ success: true, message: "admin authoraized" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res
      .status(200)
      .json({ success: true, message: "users list fetched", data: users });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Find and delete all orders associated with the user
    await Order.deleteMany({ user: deletedUser._id });

    res.status(200).json({
      success: true,
      message: "users deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.status(200).json({
      success: true,
      message: "restaurants list fetched",
      data: restaurants,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// restaurant delete
export const restaurantDelete = async (req, res) => {
  try {
    // get restaurant id from params
    const { restaurantId } = req.params;
    // find restaurant by id
    const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ message: "restaurant not found" });
    }
    res.status(200).json({
      success: true,
      message: "restaurant deleted successfully",
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user");
    res
      .status(200)
      .json({ success: true, message: "orders list fetched", data: orders });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// order delete
export const orderDelete = async (req, res) => {
  try {
    // get order id from params
    const { orderId } = req.params;
    // find order by id
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }
    res.status(200).json({
      success: true,
      message: "order deleted successfully",
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// chage restaurant status
export const changeRestaurantStatus = async (req, res) => {
  try {
    // get restaurant id from params
    const { restaurantId } = req.params;
    // find restaurant by id
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ message: "restaurant not found" });
    }
    if (restaurant.status === "Active") {
      restaurant.status = "Inactive";
    } else {
      restaurant.status = "Active";
    }

    await restaurant.save();
    res.status(200).json({
      success: true,
      message: "restaurant status changed successfully",
      data: { status: restaurant.status },
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const totalAmounts = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not available" });
    }

    // Calculate total amount
    const totalCash = orders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);

    return res.status(200).json({ success: true, data: totalCash });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};
