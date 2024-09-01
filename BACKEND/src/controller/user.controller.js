import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/apierror.js"
import {User} from "../models/user.models.js"
import {uploadcloundinary } from "../utils/cloundnary.js"
import {ApiResponse}  from "../utils/Apiresponse.js"
import mongoose from "mongoose"
import CircularJSON from 'circular-json';

const registerUser=asyncHandler(async(req,res)=>{
   const {fullname,username,password,email} =req.body;
   console.log("email",email)
   if(
    [fullname,username,password,email].some((field)=>
        field?.trim()==="")

    ){
        throw new ApiError(400,"All fields are required")
    }

  const existeduser= await User.findOne({
    $or:[{username},{email}]   //check email and username is present is not
   })
  if(existeduser){
    throw new ApiError(409,"User with email or username already exist")
  }

 const avatarLocalPath=req.files?.avatar?.[0]?.path;
 console.log(avatarLocalPath)

//  const coverImagepath=req.files?.coverImage?.[0]?.path;
let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
        console.log(coverImageLocalPath)
    }
 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is local required")
 }

const avatar=await uploadcloundinary(avatarLocalPath)
const coverImage=await uploadcloundinary(coverImageLocalPath)
console.log("coverumage",coverImage?.url)
// if(!avatar){
//     throw new ApiError(400,"Avatar file is required")
// }


const user=await User.create({fullname,
 
   coverImage:coverImage?.url || "",
    email,password
    ,username:username.toLowerCase()
 })
 const createduser=User.findById(user._id).select("-password -refreshtoekn")  // in select is which is not send response

 if(!createduser){
    throw new ApiError(500,"Something went wrong while registered the user")

 }
 return res.status(201).json(
    new ApiResponse(200,CircularJSON.stringify(createduser),"user registered Succefully")
 )
})

export {registerUser}