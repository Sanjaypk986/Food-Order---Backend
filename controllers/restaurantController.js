import { cloudinaryInstance } from "../config/cloudinaryConfig.js";
import { Restaurant } from "../models/restaurantModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { Order } from "../models/orderModel.js";
import { Food } from "../models/foodModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Transporter configuration for nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

// create restaurant

export const restaurantCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const {
      name,
      description,
      location,
      mobile,
      email,
      password,
      orders,
      category,
      makingTime,
    } = req.body;

    // validation
    if (!name || !description || !mobile || !location || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check restaurant available
    const restaurantExist = await Restaurant.findOne({ email });
    if (restaurantExist) {
      return res
        .status(400)
        .json({ success: false, message: "restaurant already exist" });
    }
    // Upload image using cloudinary
    let uploadResult;
    if (req.file) {
      uploadResult = await cloudinaryInstance.uploader
        .upload(req.file.path) //add path of file
        .catch((error) => {
          console.log(error);
        });
    }

    // password hasihng
    const salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    // create new restaurant
    const newRestaurant = new Restaurant({
      name,
      email,
      password: hashedPassword,
      location,
      mobile,
      description,
      orders,
      category,
      makingTime,
    });

    // add image if available
    if (uploadResult?.url) {
      newRestaurant.image = uploadResult.url;
    }
    // save restaurant
    await newRestaurant.save();

    // newRestaurant response
    const restaurantResponse = await Restaurant.findById(
      newRestaurant._id
    ).select("-password");
    // token creation
    //   authentication using jwt token
    const token = generateToken(email, "restaurant");
    //   send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurantResponse,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// login restaurant

export const loginRestaurant = async (req, res) => {
  try {
    // destructure values from req.body
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check restaurant available
    const restaurantExist = await Restaurant.findOne({ email });
    if (!restaurantExist) {
      return res
        .status(401)
        .json({ success: false, message: "restaurant does not exist" });
    }
    //  check pasword
    const passwordMatch = bcrypt.compareSync(
      password,
      restaurantExist.password
    );
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "unauthoraized restaurant or invalid password",
      });
    }
    //   authentication using jwt token
    const token = generateToken(email, "restaurant");
    //   send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    //   send success response
    res
      .status(200)
      .json({ success: true, message: "Restaurant login successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// logout restaurant

export const logoutRestaurant = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res
      .status(200)
      .json({ success: true, message: "Restaurant logout successfully" });
  } catch (error) {
    // send error response
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

// restaurant by id

export const restaurantProfile = async (req, res) => {
  try {
    // get restaurant id from params
    const { restaurantId } = req.params;
    // find restaurant by id
    const restaurant = await Restaurant.findById(restaurantId).select(
      "-password "
    );

    if (!restaurant) {
      return res.status(400).json({ message: "restaurant not found" });
    }
    // Fetch the food items related to the restaurant
    const foods = await Food.find({ restaurant: restaurant._id });
    res.status(200).json({
      success: true,
      message: "restaurant profile fetched",
      data: { restaurant, foods },
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// update restaurant

export const restaurantUpdate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, description, location, mobile, category, makingTime } =
      req.body;

    // get restaurant id from params
    const { restaurantId } = req.params;

    // create a variable for all data
    const updateRestaurant = {
      name,
      description,
      location,
      mobile,
      category,
      makingTime,
    };
    // check req.file have image uploads
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      updateRestaurant.image = uploadResult.url; //assign req.file.path url to image
    }
    // find restaurant by id
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateRestaurant,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "restaurant data updated",
      data: updatedRestaurant,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// get orders
export const getRestaurantOrders = async (req, res) => {
  try {
    // Get the restaurant ID from the authenticated restaurant
    const restaurant = req.restaurant;
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find orders where the restaurant is part of the "restaurants" array
    const orders = await Order.find({
      "restaurants.restaurant": restaurant._id,
    })
      .populate({
        path: "restaurants.items.food", // Populate food details
        select: "name price image",
      })
      .populate({
        path: "user", // Populate user details
        select: "-password -email -orders",
        populate: {
          path: "address", // Populate the address inside user
        },
      });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this restaurant" });
    }

    // Include order._id in each restaurant order
    const restaurantOrders = orders
      .map((order) => {
        const restaurantOrder = order.restaurants.find((rest) =>
          rest.restaurant.equals(restaurant._id)
        );
        return restaurantOrder
          ? {
              ...restaurantOrder.toObject(),
              orderId: order._id,
              user: order.user,
            }
          : null;
      })
      .filter((order) => order); //filtering to remove its undefined

    res.status(200).json({
      success: true,
      message: "Orders list fetched",
      data: restaurantOrders, // Send the orders with the included orderId
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

// get order by id
export const getSingleOrder = async (req, res) => {
  try {
    //  get orderId from params
    const { orderId } = req.params;
    // find order
    const singleOrder = await Order.findById(orderId);
    if (!singleOrder) {
      res.status(404).json({ message: "order not found" });
    }

    res.status(200).json({
      success: true,
      message: "order details fetched",
      data: singleOrder,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// confirm order
export const orderStatus = async (req, res) => {
  try {
    const { status, orderId } = req.body;

    const restaurant = req.restaurant;

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // find the order using order id and restaurant id
    const order = await Order.findOne({
      _id: orderId,
      "restaurants.restaurant": restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or does not belong to this restaurant",
      });
    }

    // Find the restaurant order
    const restaurantEntry = order.restaurants.find(
      (rest) => rest.restaurant.equals(restaurant._id) //comparing with restaurant._id
    );

    if (!restaurantEntry) {
      return res
        .status(404)
        .json({ message: "Restaurant entry not found in the order" });
    }

    if (restaurantEntry.status === "Cancelled") {
      return res
        .status(400)
        .json({ message: "Order has already been cancelled" });
    }

    // Update the status of the restaurant entry
    restaurantEntry.status = status;

    // Save the updated order
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// check restaurant
export const checkRestaurant = async (req, res) => {
  try {
    const restaurant = req.restaurant;
    if (!restaurant) {
      res
        .status(404)
        .json({ success: false, message: "restaurant not authoraized" });
    }
    res.status(200).json({ success: true, message: "authoraized restaurant" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// restaurant profile for restaurant

export const authRestaurantProfile = async (req, res) => {
  try {
    // get restaurant id from params
    const restaurant = req.restaurant;
    if (!restaurant) {
      return res.status(400).json({ message: "restaurant not found" });
    }
    // Fetch the food items related to the restaurant
    const foods = await Food.find({ restaurant: restaurant._id });
    res.status(200).json({
      success: true,
      message: "restaurant profile fetched",
      data: { restaurant, foods },
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// reset password request
export const restaurantResetRequest = async (req, res) => {
  try {
    // destructure email
    const { email } = req.body;

    // find restaurant with email id
    const restaurant = await Restaurant.findOne({ email });

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    // create a token using restaurant.id
    const token = jwt.sign(
      { restaurantId: restaurant._id },
      process.env.JWT_RESET_KEY,
      {
        expiresIn: "5m",
      }
    );

    // nodemailer configure
    const resetUrl = `${process.env.CLIENT_DOMAIN}/restaurant/reset-password?token=${token}`;
    const mailOptions = {
      to: restaurant.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  .button {
                    display: inline-block;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2 style="text-align: center; color: #007bff;">Password Reset Request</h2>
                  <p>Hello,</p>
                  <p>You have requested to reset your password. Click the link below to proceed:</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </p>
                  <p style="color: #666;">This link will expire in 5 minutes.</p>
                  <p>If you did not request this, please ignore this email.</p>
                </div>
              </body>
            </html>
          `,
    };
    // send mail to restaurant
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// reset password
export const restaurantResetPassword = async (req, res) => {
  // destructure token and newpassword
  const { token, newPassword } = req.body;
  try {
    // verify jwt token
    const decoded = jwt.verify(token, process.env.JWT_RESET_KEY);
    // find restaurant with restaurant.id from jwt verify
    const restaurant = await Restaurant.findById(decoded.restaurantId);
    // check restaurant available
    if (!restaurant) {
      return res.status(404).send("restaurant not found");
    }
    // change restaurant password using new password
    restaurant.password = await bcrypt.hash(newPassword, 10);
    // save restaurant
    await restaurant.save();
    res.send("Password reset successful");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send("Internal Server Error");
  }
};
