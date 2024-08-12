
export const userCreate = async ()=>{
    // destructure values from req.body
    const {name,email,mobile,password,profilePic} = req.body
    // validation
    if (!name ||!email || !mobile || !password) {
        return res.status(400).json({success:false,message:"All fields required"})
    }
    
}