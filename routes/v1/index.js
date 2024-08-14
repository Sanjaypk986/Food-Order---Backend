import express from "express";
import userRouter from "./userRoutes.js";
import restaurantRouter from "./restaurantRoutes.js";
const v1Router = express.Router();

v1Router.use("/user",userRouter );
v1Router.use("/restaurant",restaurantRouter );


export default v1Router;
