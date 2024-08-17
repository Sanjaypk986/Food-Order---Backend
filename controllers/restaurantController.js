import { cloudinaryInstance } from "../config/cloudinaryConfig.js";
import { Restaurant } from "../models/restaurantModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

// create restaurant

export const restaurantCreate = async (req, res) => {
  try {
    
    // destructure values from req.body
    const { name, description, location, mobile, email, password, orders} = req.body;
    // validation
    if (!name || !description || !mobile || !location ||!email || !password) {
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
      const uploadResult = await cloudinaryInstance.uploader
      .upload(req.file.path) //add path of file
      .catch((error) => {
        console.log(error);})

        // password hasihng 
        const salt = 10;
        const hashedPassword = bcrypt.hashSync(password, salt);
    // create new restaurant
    const newRestaurant = new Restaurant({
      name,
      email,
      password:hashedPassword,
      location,
      mobile,
      description,
      orders
    });

    // add image if available
    if (uploadResult?.url) {
      newRestaurant.image = uploadResult.url
    }
    // save restaurant
    await newRestaurant.save();
    
    // newRestaurant response
    const restaurantResponse = await Restaurant.findById(newRestaurant._id).select(
      "-password"
    );
    // token creation 
        //   authentication using jwt token
        const token = generateToken(email, "restaurant");
        //   send token as cookie
        res.cookie("token", token);
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
    const passwordMatch = bcrypt.compareSync(password, restaurantExist.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "unauthoraized restaurant or invalid password",
      });
    }
    //   authentication using jwt token
    const token = generateToken(email, "restaurant");
    //   send token as cookie
    res.cookie("token", token);
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
    // clear token in cookie
    res.clearCookie("token");
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

// restaurant by id 

export const restaurantProfile = async (req, res) => {
  try {
    // get restaurant id from params
    const { restaurantId } = req.params;
    // find restaurant by id
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      return res.status(400).json({ message: "restaurant not found" });
    }
    res.status(200).json({ success: true, message: "restaurant profile fetched", data:restaurant});
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
    const { name, description, location, mobile } = req.body;
    // get restaurant id from params
    const { restaurantId } = req.params;

    // create a variable for all data 
    const updateRestaurant = {
      name, description, location,mobile
    }
    // check req.file have image uploads
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(req.file.path)
      updateRestaurant.image = uploadResult.url //assign req.file.path url to image
    }
        // find restaurant by id
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId,updateRestaurant,{new:true})

    res.status(200).json({ success: true, message: "restaurant data updated", data:updatedRestaurant});
  } catch (error) {
    // send error response
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
    const restaurant = await Seller.findByIdAndDelete(restaurantId);
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