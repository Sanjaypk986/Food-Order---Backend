import { Cart } from "../models/cartModel.js";
import { Coupon } from "../models/couponModel.js";
import { User } from "../models/userModel.js";

// create coupon
export const createCoupon = async (req, res) => {
  // get data from req.body
  const { code, discount, isPercentage } = req.body;

  if (!code || discount === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "all field required" });
  }
  // find existing Coupon
  const existCoupon = await Coupon.findOne({ "coupons.code": code });
  if (existCoupon) {
    return res
      .status(400)
      .json({ success: false, message: "coupon already exists..." });
  }
  // create coupon
  const newCoupon = new Coupon({
    coupons: [{ code, discount, isPercentage }],
  });
  await newCoupon.save();
  res.status(200).json({
    success: true,
    message: "coupon created successfully",
    data: newCoupon,
  });
};

// get all coupons
export const getallCoupons = async (req, res) => {
  const coupons = await Coupon.find({});
  if (coupons.length < 1) {
    return res
      .status(400)
      .json({ success: false, message: "coupons not available" });
  }

  res.status(200).json({
    success: true,
    message: "coupons fetched successfully",
    data: coupons,
  });
};

export const updateCoupon = async (req, res) => {
  try {
    // Get data from req.body
    const { code, discount, isPercentage } = req.body;
    if (!code || discount === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Find the document containing the coupon
    const couponDoc = await Coupon.findOne({ "coupons.code": code });
    if (!couponDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    // Find the index of the coupon in the array
    const couponIndex = couponDoc.coupons.findIndex((c) => c.code === code);
    if (couponIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found in the array" });
    }

    // Update the specific coupon in the array
    couponDoc.coupons[couponIndex].discount = discount;
    couponDoc.coupons[couponIndex].isPercentage = isPercentage;

    // Save the document
    await couponDoc.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: couponDoc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// apply coupon
export const applyCoupon = async (req, res) => {
  try {
    // destructure user
    const userInfo = req.user;
    
    // get coupon from req.body
    const { code } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "coupon not available" });
    }
    //   find user
    //   find coupon using code
   // Find the user by email
const user = await User.findOne({ email: userInfo.email });
if (!user) {
  return res.status(404).json({ success: false, message: "User not found" });
}

// Find coupon by code
const coupon = await Coupon.findOne({ "coupons.code": code });
if (!coupon) {
  return res.status(400).json({ success: false, message: "Invalid coupon code" });
}

// Find cart
const cart = await Cart.findOne({ user: user._id });
if (!cart) {
  return res.status(404).json({ success: false, message: "Cart not found" });
}

let discount = 0;

// Apply the coupon based on its code
if (code === "WELCOME50%") {
  // Check if the user has any orders
  if (user.orders.length === 0) {
    // Apply 50% discount for first orders only
    discount = cart.total * 0.5; // 50% discount
  } else {
    return res.status(400).json({
      success: false,
      message: "Coupon valid only for first order",
    });
  }
} else if (code === "ORDER500") {
  // Apply 100 rs discount for orders above 500 rs
  if (cart.total >= 500) {
    discount = 100;
  } else {
    return res.status(400).json({
      success: false,
      message: "Minimum cart total of 500 required for ORDER500 coupon",
    });
  }
} else if (code === "ORDER1000") {
  // Apply 200 rs discount for orders above 1000 rs
  if (cart.total >= 1000) {
    discount = 200;
  } else {
    return res.status(400).json({
      success: false,
      message: "Minimum cart total of 1000 required for ORDER1000 coupon",
    });
  }
} else {
  return res
    .status(400)
    .json({ success: false, message: "Coupon code not recognized" });
}

// Apply the discount to the cart total
if (discount > 0) {
    cart.total -= discount;
    if (cart.total < 0) cart.total = 0; // Ensure total doesn't go negative
    await cart.save(); // Save the updated cart
  }

res.status(200).json({
  success: true,
  message: "Coupon applied successfully",
  data: { cart },
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
