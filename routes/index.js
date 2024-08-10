const v1Router = express.Router();
import userRouter from "./userRoutes.js";
v1Router.use('/user',userRouter)