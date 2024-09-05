import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/apierror.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyjwt=asyncHandler(async (req,res,next)=>{
   
   try{

    const token= req.cookies?.accesstoekn || req.header("Authorization")?.replace("Bearer ", "")
    console.log("hhhhhhhhhhhh",token)
   if(!token){
    throw new ApiError(401,"Unautharised request")
   }

const decode=jwt.verify(token,process.env.ACCESS_TOKEN_SECREST)
console.log("jwt secre",process.env.ACCESS_TOKEN_SECREST)
const user=await User.findById(decode?._id).select("-password -refreshToken")
if(!user){
    throw new ApiError(401,"Inavlid Access Token")

}

req.user=user
   next()}
   catch(error){
  throw new ApiError(4001,error?.message || "Invalid access token")
   }

})

