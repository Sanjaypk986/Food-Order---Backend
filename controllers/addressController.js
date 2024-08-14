import { Address } from "../models/addressModel.js";

// create address

export const addressCreate = async (req, res) => {
  try {
    // destructure values from req.body
    const { firstname, lastname, city, street, mobile, pincode } = req.body;
    // validation
    if (!firstname || !street || !city || !mobile || !pincode) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    // create new address
    const newAddress = new Address({
      firstname,
      lastname,
      city,
      street,
      mobile,
      pincode,
    });
    // save address
    await newAddress.save();
    res.status(200).json({
      success: true,
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (error) {
    // send error response
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// update address

export const addressUpdate = async (req, res) => {
    try {
      // destructure values from req.body
      const { firstname, lastname, city, street, mobile, pincode  } = req.body;
      // get address id from params
      const { addressId } = req.params;
      // find address by id
      const updatedAddress = await Address.findByIdAndUpdate(addressId,{firstname, lastname, city, street, mobile, pincode },{new:true})
  
      res.status(200).json({ success: true, message: "address data updated", data:updatedAddress});
    } catch (error) {
      // send error response
      res
        .status(error.status || 500)
        .json({ message: error.message || "Internal server error" });
    }
  };