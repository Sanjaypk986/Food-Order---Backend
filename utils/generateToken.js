import jwt from 'jsonwebtoken'

export const generateToken =(email,role)=>{
   try {
    if (!email) {
        res.status(400).json({message:"Cannot generate token or invalid email"})
    }
    const token = jwt.sign({ email:email,role:role || 'user'}, process.env.USER_JWT_SECRET_KEY);
    return token
   } catch (error) {
    res.status(500).json({message:"internal server error"})
   }
}