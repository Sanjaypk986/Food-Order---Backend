import mongoose from "mongoose"

const restaurantSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    mobile: {
        type: String,
        required: true,
        unique: true, 
        match: /^[0-9]{10}$/, 
    },
    image: {
        type: String,
        default:
          "https://thumbs.wbm.im/pw/small/a652b5289b42e733469e0ec088a24eb1.jpg",
      },
  });
  export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
