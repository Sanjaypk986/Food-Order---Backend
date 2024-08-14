import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    default: '', 
  },
  mobile: {
    type: String, 
    required: true,
    match: /^[0-9]{10}$/, 
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pincode: {
    type: String, 
    required: true,
    match: /^[0-9]{5,6}$/, 
  },
});

export const Address = mongoose.model("Address", addressSchema);
