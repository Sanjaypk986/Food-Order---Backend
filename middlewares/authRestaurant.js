import jwt from "jsonwebtoken";
import { Restaurant } from "../models/restaurantModel.js";

export const authRestaurant = async(req, res, next) => {
  try {
    // destructure token from cookies
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ succuss: false, message: "unauthoraized restaurant" });
    }
    // verify token using jwt verify
    const verifiedToken = jwt.verify(token, process.env.RESTAURANT_JWT_SECRET_KEY);

    if (!verifiedToken) {
      return res
        .status(401)
        .json({ succuss: false, message: "unauthoraized restaurant" });
    }
        // Fetch restaurant from the database using the id from the token
        const restaurant = await Restaurant.findOne({ email: verifiedToken.email })
        .select("-password");
  
      if (!restaurant) {
        return res
          .status(401)
          .json({ success: false, message: "Restaurant not found" });
      }
  
      // Attach Restaurant to the request object
      req.restaurant = restaurant;
      next();
  } catch (error) {
    res
    .status(error.status || 500)
    .json({ message: error.message || "interal server error" });
  }
};
