import jwt from "jsonwebtoken";

export const authRestaurant = (req, res, next) => {
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
    // to get restaurant data from jwt
    req.restaurant = verifiedToken;
    // next middleware function
    next();
  } catch (error) {
    res
    .status(error.status || 500)
    .json({ message: error.message || "interal server error" });
  }
};
