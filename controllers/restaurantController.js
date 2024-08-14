import { Restaurant } from "../models/restaurantModel.js";

// create restaurant

export const restaurantCreate = async (req, res) => {
  try {
    
    // destructure values from req.body
    const { name, description, location, image, mobile } = req.body;
    // validation
    if (!name || !description || !mobile || !location) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // check restaurant available
    const restaurantExist = await Restaurant.findOne({ name });
    if (restaurantExist) {
      return res
        .status(400)
        .json({ success: false, message: "restaurant already exist" });
    }
    // create new restaurant
    const newRestaurant = new Restaurant({
      name,
      location,
      mobile,
      description,
      image,
    });
    // save restaurant
    await newRestaurant.save();
    res.status(200).json({
      success: true,
      message: "Restaurant created successfully",
      data: newRestaurant,
    });
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
    const { name, description, location, image, mobile } = req.body;
    // get restaurant id from params
    const { restaurantId } = req.params;
    // find restaurant by id
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId,{name, description, location, image, mobile},{new:true})

    res.status(200).json({ success: true, message: "restaurant data updated", data:updatedRestaurant});
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};