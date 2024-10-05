import { cloudinaryInstance } from "../config/cloudinaryConfig.js";
import { Food } from "../models/foodModel.js";

// create food
export const foodCreate = async (req, res) => {
  try {
    const restaurantInfo = req.restaurant;
    const restaurant = restaurantInfo._id;
    // destructure values from req.body
    const { name, description, category, price } = req.body;
    // validation
    if (!name || !description || !price || !category || !restaurant) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    // image coludonary upload
    const uploadResult = await cloudinaryInstance.uploader
      .upload(req.file.path)
      .catch((error) => {
        console.log(error);
      });

    // create new food
    const newFood = new Food({
      name,
      description,
      category,
      price,
      restaurant,
    });
    // check req.file have image url
    if (uploadResult?.url) {
      newFood.image = uploadResult.url; //assign image to newFood
    }
    // save food
    await newFood.save();
    res.status(200).json({
      success: true,
      message: "Food created successfully",
      data: newFood,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// update food

export const foodUpdate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, description, category, price } = req.body;
    // get food id from params
    const { foodId } = req.params;
    const updateFood = {
      name,
      description,
      category,
      price,
    };
    // check req.file have image
    if (req.file) {
      const uploadResult = await cloudinaryInstance.uploader.upload(
        req.file.path
      );
      updateFood.image = uploadResult.url; // assign url to updatefood image
    }
    // find food by id
    const updatedFood = await Food.findByIdAndUpdate(foodId, updateFood, {
      new: true,
    });

    res
      .status(200)
      .json({ success: true, message: "food data updated", data: updatedFood });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// get food by id
export const getFoodById = async (req, res) => {
  try {
    const { foodId } = req.params;
    const food = await Food.findById(foodId).populate({
      path: "restaurant",
      select: "-password -orders -email",
    });
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }
    res.status(200).json({ success: true, food });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all food
export const getAllFoods = async (req, res) => {
  try {
    // find foods
    const getFoodList = await Food.find({}).populate({
      path: "restaurant",
      select: "-password -email -orders", // Exclude these fields
    });
    const foods = getFoodList.filter(
      (food) => food.restaurant.status === "Active"
    );
    res
      .status(200)
      .json({ success: true, message: "food list fetched", data: foods });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// delete food
export const deleteFood = async (req, res) => {
  try {
    // get food id
    const { foodId } = req.params;
    // find foods
    const deletedFood = await Food.findByIdAndDelete(foodId);
    if (!deletedFood) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "food deleted successfully" });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// search foods
export const searchFoods = async (req, res) => {
  try {
    // get parameters from the query
    const { search, category, sort } = req.query;

    // Build a query object
    const query = {};

    // Handle search query (case-insensitive search)
    if (search) {
      query.name = new RegExp(search, "i"); //regular expression
    }

    // Handle category query
    if (category) {
      query.category = new RegExp(`^${category}$`, "i");
    }

    // Determine sort options
    let sortOptions = {};
    if (sort) {
      sortOptions = { price: sort === "asc" ? 1 : -1 }; //mongodb inbulit sorting
    }

    //find food items from the database
    const foods = await Food.find(query).sort(sortOptions);

    // Respond with the results
    res.status(200).json({ success: true, foods });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};
