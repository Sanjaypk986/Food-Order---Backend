

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
    const { name, description, category, price, restaurant } = req.body;
    // get food id from params
    const { foodId } = req.params;
    const updateFood = {
      name,
      description,
      category,
      price,
      restaurant,
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

// get all food
export const getAllFoods = async (req, res) => {
    try {

      // find foods 
      const getFoodList = await Food.find({})
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
