import express from "express";
import userRouter from "./userRoutes.js";
import restaurantRouter from "./restaurantRoutes.js";
import foodRouter from "./foodRoutes.js";
import cartRouter from "./cartRoutes.js";
import addressRouter from "./addressRoutes.js";
import orderRouter from "./orderRoutes.js";
import couponRouter from "./couponRoutes.js";
const v1Router = express.Router();

v1Router.use("/user",userRouter );
v1Router.use("/restaurant",restaurantRouter );
v1Router.use("/food",foodRouter );
v1Router.use("/address", addressRouter);
v1Router.use("/cart", cartRouter);
v1Router.use("/order", orderRouter);
v1Router.use("/coupons", couponRouter);

export default v1Router;
