import { Coupon } from "../models/couponModel.js"

// create coupon
export const createCoupon = async(req,res)=>{
    // get data from req.body
    const {code,discount,isPercentage} = req.body

    if (!code || discount === undefined) {
        return res.status(400).json({success:false,message:"all field required"})
    }
    // find existing Coupon 
    const existCoupon = await Coupon.findOne({'coupons.code': code})
    if (existCoupon) {
        return res.status(400).json({success:false,message:"coupon already exists..."})
    }
    // create coupon
    const newCoupon = new Coupon({
        coupons:[{ code, discount, isPercentage }]
    })
    await newCoupon.save()
    res.status(200).json({success:true,message:"coupon created successfully", data:newCoupon})

}

// get all coupons
export const getallCoupons = async(req,res)=>{


    const coupons = await Coupon.find({})
    if (coupons.length<1) {
        return res.status(400).json({success:false,message:"coupons not available"})
    }

    res.status(200).json({success:true,message:"coupons fetched successfully", data:coupons})

}

export const updateCoupon = async (req, res) => {
    try {
      // Get data from req.body 
      const { code, discount, isPercentage } = req.body;
      if (!code || discount === undefined) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      // Find the document containing the coupon
      const couponDoc = await Coupon.findOne({ "coupons.code": code });
      if (!couponDoc) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
  
      // Find the index of the coupon in the array
      const couponIndex = couponDoc.coupons.findIndex(c => c.code === code);
      if (couponIndex === -1) {
        return res.status(404).json({ success: false, message: "Coupon not found in the array" });
      }
  
      // Update the specific coupon in the array
      couponDoc.coupons[couponIndex].discount = discount;
      couponDoc.coupons[couponIndex].isPercentage = isPercentage;
  
      // Save the document
      await couponDoc.save();
  
      res.status(200).json({ success: true, message: "Coupon updated successfully", data: couponDoc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  