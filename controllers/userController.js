import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { generateToken } from "../utils/generateToken.js";
import { cloudinaryInstance } from "../config/cloudinaryConfig.js";
import jwt from 'jsonwebtoken';

// Transporter configuration for nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

// create user
export const userCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, email, mobile, password } = req.body;
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
    // Upload an image cloudinary
    let uploadResult;
    // Upload an image to Cloudinary if a file is provided
    if (req.file) {
      uploadResult = await cloudinaryInstance.uploader
        .upload(req.file.path)
        .catch((error) => {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Error uploading image" });
        });
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
    });
    // check req.file.path have image url
    if (uploadResult?.url) {
      newUser.profilePic = uploadResult.url; // assign url to profilePic
    }
    // save user
    await newUser.save();
    // to remove password from response
    const userResponse = await User.findById(newUser._id).select("-password");
    //   authentication using jwt token
    const token = generateToken(email, "user");
    //   send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    //   send success response
    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
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
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("Validation failed: Missing email or password");
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    // Check user availability
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    // Check password
    const passwordMatch = bcrypt.compareSync(password, userExist.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user or invalid password",
      });
    }

    // Generate JWT token
    const token = generateToken(email, "user");
    // Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: "User login successfully",
      data: {
        ...userExist._doc,
        password: undefined, // Hide password from response
      },
    });
  } catch (error) {
    console.error("Error during login:", error); // Log error
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res
      .status(200)
      .json({ success: true, message: "User logout successfully" });
  } catch (error) {
    console.error("Error clearing cookie:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// user profile
export const userProfile = async (req, res) => {
  try {
    const user = req.user; // Already fetched by authUser middleware

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User profile fetched", data: user });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// update user
export const userUpdate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, email, mobile, password } = req.body;
    // get user id from params
    const { userId } = req.params;
    const updatedData = {
      name,
      email,
      mobile,
      password,
    };
    // check req.file available
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      updatedData.profilePic = uploadResult.url; //assign url to profilePic
    }
    // find user by id
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res
      .status(200)
      .json({ success: true, message: "user data updated", data: updatedUser });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// check user
export const checkUser = async (req, res, next) => {
  try {
    // get user data from auth middleware
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "unauthoraized user" });
    }
    res.status(200).json({ success: true, message: "authoraized user" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// reset password request
export const resetRequest = async (req, res) => {
  try {
    // destructure email
    const { email } = req.body;
    
    // find user with email id
    const user = await User.findOne({ email });
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // create a token using user.id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_RESET_KEY, {
      expiresIn: "5m",
    });
    
    // nodemailer configure
    const resetUrl = `${process.env.CLIENT_DOMAIN}/reset-password?token=${token}`;
    const mailOptions = {
      to: user.email,
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
    // send mail to user
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
export const resetPassword = async (req, res) => {
  // destructure token and newpassword
  const { token, newPassword } = req.body;
  try {
    // verify jwt token
    const decoded = jwt.verify(token, process.env.JWT_RESET_KEY);
    // find user with user.id from jwt verify
    const user = await User.findById(decoded.userId);
    // check user available
    if (!user) {
      return res.status(404).send("User not found");
    }
    // change user password using new password
    user.password = await bcrypt.hash(newPassword, 10);
    // save user
    await user.save();
    res.send("Password reset successful");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send("Internal Server Error");
  }
};
