import { Cart } from "../models/cartModel.js";
import { Coupon } from "../models/couponModel.js";

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
    const user = req.user;
    const { code } = req.body; // get code from req.body

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon not provided" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ "coupons.code": code });
    if (!coupon) {
      return res.status(400).json({ success: false, message: "Invalid coupon code" });
    }

    const cart = await Cart.findOne({ user: user._id }); //find cart
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    if (cart.couponApplied) { // already applied coupon
      return res.status(400).json({
        success: false,
        message: "A coupon has already been applied",
      });
    }

    let discount = 0;  //initialize discount

    // Coupon eligibility logic
    if (code === "WELCOME50%") {  // only first order coupon
      if (user.orders.length === 0) {
        discount = cart.total * 0.5; // half the total
      } else {
        return res.status(400).json({
          success: false,
          message: "Coupon valid only for first order",
        });
      }
    } else if (code === "ORDER500" && cart.total >= 500) { //order above 500
      discount = 100;
    } else if (code === "ORDER1000" && cart.total >= 1000) {
      discount = 200;
    } else {
      return res.status(400).json({
        success: false,
        message: "Coupon not applicable to this cart total",
      });
    }

    // Apply discount
    cart.total -= discount;  //minus the amount in total
    cart.total = Math.max(cart.total, 0); // this method used for not going price to negative
    cart.couponApplied = true;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: { cart },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// remove coupon from cart
export const removeCoupon = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ user: user._id }).populate('items.food'); // Populate food details if needed
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    if (!cart.couponApplied) {
      return res.status(400).json({
        success: false,
        message: "No coupon applied",
      });
    }

    // Recalculate cart total without the coupon
    let total = 0;
    cart.items.forEach(item => {
      total += item.quantity * item.food.price; // Assuming food.price holds the price of each food item
    });

    // Update cart total
    cart.total = total;
    cart.couponApplied = false;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      data: { cart },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

