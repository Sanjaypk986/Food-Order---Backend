import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^\+91[0-9]{10}$/, // Regex to validate E.164 format with +91 prefix
  },
  image: {
    type: String,
    default:
      "https://lh3.googleusercontent.com/QAvQPtQv43Qxw97GLdPJmyhYqmFLOD1dY6GFCHTNQoDNy6bMSknpfdDRFOKicCKbIn5JjEJcqj4DujHhC6v7uGDA-1o=w1200-rw",
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  category: 
    {
      type: [String],
      default:['South Indian ', ' North Indian']
    },
    makingTime: 
    {
      type: String,
      default:'15-30 mins'
    },
    status:{
      type: String,
      enum: ['Active', 'Inactive'],
        default: 'Inactive',
    }
});
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
