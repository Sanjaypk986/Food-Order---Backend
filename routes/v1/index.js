import express from "express";
import { userCreate } from "../../controllers/userController.js";
const v1Router = express.Router();

v1Router.use("/user",userCreate );


export default v1Router;
