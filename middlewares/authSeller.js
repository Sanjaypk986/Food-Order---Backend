import jwt from "jsonwebtoken";

export const authseller = (req, res, next) => {
  try {
    // destructure token from cookies
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ succuss: false, message: "unauthoraized seller" });
    }
    // verify token using jwt verify
    const verifiedToken = jwt.verify(token, process.env.SELLER_JWT_SECRET_KEY);

    if (!verifiedToken) {
      return res
        .status(401)
        .json({ succuss: false, message: "unauthoraized seller" });
    }
    // to get seller data from jwt
    req.seller = verifiedToken;
    // next middleware function
    next();
  } catch (error) {
    res
    .status(error.status || 500)
    .json({ message: error.message || "interal server error" });
  }
};
