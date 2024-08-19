import { Admin } from "../models/adminModel.js";
import { User } from "../models/userModel.js";

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
    res.cookie("token", token);
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
    res.cookie("token", token);
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
    // clear token in cookie
    res.clearCookie("token");
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
    const admin = user.admin;
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
    const deleteduser = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
      res
        .status(200)
        .json({ success: true, message: "users deleted successfully", data: deleteduser});
    } catch (error) {
      res
        .status(error.status || 500)
        .json({ message: error.message || "Internal server error" });
    }
  };