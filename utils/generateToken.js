import jwt from 'jsonwebtoken'

export const generateToken =(email,role)=>{
    const token = jwt.sign({ email:email,role:role || 'user'}, process.env.JWT_SECRET_KEY);
    return token
}