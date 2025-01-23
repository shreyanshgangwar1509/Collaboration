import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
export const protect=async(req,res,next) => {
    //get token the user is passing
    let token;
    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ){
        try {
            token=req.headers.authorization.split(" ")[1];
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            req.user=await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({message:"Not authorized, token failed"});   
        }
        if(!token){
            res.status(401).json({message:"No User found"}); 
        }
    }
};

export const isAdmin=async(req,res,next) => {
    try {
        if(req.user && req.user.isAdmin) {
            next();
        }
        else{
            res.status(403).json({message:"Not Authorized admin only"});
        }
    } catch (error) {
        res.status(401).json({message:"Not Authorized"});
    }
}
