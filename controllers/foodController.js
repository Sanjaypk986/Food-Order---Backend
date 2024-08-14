// create food

import { Food } from "../models/foodModel.js";

export const foodCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { name, description, category, image, price, restaurant } = req.body;
    // validation
    if (!name || !description || !price || !category || !restaurant) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    // create new food
    const newFood = new Food({
      name,
      description,
      category,
      image,
      price,
      restaurant,
    });
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
      const { name, description, category, image, price, restaurant } = req.body;
      // get food id from params
      const { foodId } = req.params;
      // find food by id
      const updatedFood = await Food.findByIdAndUpdate(foodId,{name, description, category, image, price, restaurant},{new:true})
  
      res.status(200).json({ success: true, message: "food data updated", data:updatedFood});
    } catch (error) {
      // send error response
      res
        .status(error.status || 500)
        .json({ message: error.message || "Internal server error" });
    }
  };