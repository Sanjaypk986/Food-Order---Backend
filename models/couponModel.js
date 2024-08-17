import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  coupons: [
    {
      code: {
        type: String,
        unique: true,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      isPercentage: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

export const Coupon = mongoose.model("Coupon", couponSchema);
