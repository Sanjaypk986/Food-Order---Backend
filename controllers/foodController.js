import { cloudinaryInstance } from "../config/cloudinaryConfig.js";
import { Food } from "../models/foodModel.js";

// create food
export const foodCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, description, category, price, restaurant } = req.body;
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
    const getFoodList = await Food.find({});
    res
      .status(200)
      .json({ success: true, message: "food list fetched", data: getFoodList });
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
    // Extract search parameters from the query string
    const { name, category, minPrice, maxPrice } = req.query;

    // Build the query object based on provided search parameters
    const query = {};

    // Handle name query (case-insensitive search)
    if (name) {
      query.name = new RegExp(name, "i"); // Case-insensitive search
    }

    // Handle category query
    if (category) {
      // Build an array of case-insensitive regex patterns directly from the array
      query.category = {
        $in: category.map((cat) => new RegExp(`^${cat}$`, "i")),
      };
    }

    // Handle price range query
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Fetch matching food items from the database
    const foods = await Food.find(query);


    // Respond with the results
    res.status(200).json({ success: true, foods });
  } catch (error) {
    // Handle any errors
    console.error("Error:", error.message); // Log the error for debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
};
