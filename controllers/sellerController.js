import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { Seller } from "../models/sellerModel.js";

// create seller
export const sellerCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { email, mobile, password, restaurant } = req.body;
    // validation
    if (!email || !mobile || !password || !restaurant) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check seller available
    const sellerExist = await Seller.findOne({ email });
    if (sellerExist) {
      return res
        .status(400)
        .json({ success: false, message: "seller already exist" });
    }

    // password hashing
    const salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create new seller
    const newSeller = new Seller({
      email,
      mobile,
      password: hashedPassword,
      restaurant,
    });

    // save seller
    await newSeller.save();

    // to remove password from response
    const sellerResponse = await Seller.findById(newSeller._id).select(
      "-password"
    );

    //   authentication using jwt token
    const token = generateToken(email, "seller");
    //   send token as cookie
    res.cookie("token", token);

    //   send success response
    res.status(200).json({
      success: true,
      message: "Seller created successfully",
      data: sellerResponse,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// login seller

export const loginSeller = async (req, res) => {
  try {
    // destructure values from req.body
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check seller available
    const sellerExist = await Seller.findOne({ email });
    if (!sellerExist) {
      return res
        .status(401)
        .json({ success: false, message: "seller does not exist" });
    }
    //  check pasword
    const passwordMatch = bcrypt.compareSync(password, sellerExist.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "unauthoraized seller or invalid password",
      });
    }
    //   authentication using jwt token
    const token = generateToken(email, "seller");
    //   send token as cookie
    res.cookie("token", token);
    //   send success response
    res
      .status(200)
      .json({ success: true, message: "Seller login successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// logout seller

export const logoutSeller = async (req, res) => {
  try {
    // clear token in cookie
    res.clearCookie("token");
    res
      .status(200)
      .json({ success: true, message: "Seller logout successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// seller profile

export const sellerProfile = async (req, res) => {
  try {
    // get seller id from params
    const { sellerId } = req.params;
    // find seller by id
    const seller = await Seller.findById(sellerId)
      .select("-password")
      .populate("restaurant");
    if (!seller) {
      return res.status(400).json({ message: "Seller not found" });
    }
    res.status(200).json({
      success: true,
      message: "Seller profile fetched",
      data: seller,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// seller delete

export const sellerDelete = async (req, res) => {
  try {
    // get seller id from params
    const { sellerId } = req.params;
    // find seller by id
    const seller = await Seller.findByIdAndDelete(sellerId);
    if (!seller) {
      return res.status(400).json({ message: "Seller not found" });
    }
    res.status(200).json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};
