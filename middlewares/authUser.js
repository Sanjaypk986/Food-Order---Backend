import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const authuser = async (req, res, next) => {
  try {
    // destructure token from cookies
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ succuss: false, message: "unauthoraized user" });
    }
    // verify token using jwt verify
    const verifiedToken = jwt.verify(token, process.env.USER_JWT_SECRET_KEY);

    if (!verifiedToken) {
      return res
        .status(401)
        .json({ succuss: false, message: "unauthoraized user" });
    }

    // fetch user from the database using the id from the token
    const user = await User.findOne({ email: verifiedToken.email })
      .select("-password")
      .populate("address");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "interal server error" });
  }
};
