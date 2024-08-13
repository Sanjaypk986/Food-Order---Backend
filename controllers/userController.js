import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

// create user

export const userCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, email, mobile, password, profilePic } = req.body;
    // validation
    if (!name || !email || !mobile || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check user available
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "user already exist" });
    }
    // password hashing
    const salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create new user
    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      profilePic,
    });
    // save user
    await newUser.save();
    //   authentication using jwt token
    const token = generateToken(email);
    //   send token as cookie
    res.cookie("token", token);
    //   send success response
    res
      .status(200)
      .json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// login user

export const loginUser = async (req, res) => {
  try {
    // destructure values from req.body
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check user available
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res
        .status(401)
        .json({ success: false, message: "user does not exist" });
    }
    //  check pasword
    const passwordMatch = bcrypt.compareSync(password, userExist.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "unauthoraized user or invalid password",
      });
    }
    //   authentication using jwt token
    const token = generateToken(email);
    //   send token as cookie
    res.cookie("token", token);
    //   send success response
    res.status(200).json({ success: true, message: "User login successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// logout user

export const logoutUser = async (req, res) => {
  try {
    // clear token in cookie
    res.clearCookie("token");
    res
      .status(200)
      .json({ success: true, message: "User logout successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// user profile

export const userProfile = async (req, res) => {
  try {
    // get user id from params
    const { userId } = req.params;
    // find user by id
    const userProfile = await User.findById(userId).select("-password"); // select is used to avoid password as response
    if (!userProfile) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User profile fetched" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};
