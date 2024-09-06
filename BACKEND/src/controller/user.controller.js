import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/apierror.js"
import {User} from "../models/user.models.js"
import {uploadcloundinary } from "../utils/cloundnary.js"
import {ApiResponse}  from "../utils/Apiresponse.js"
import mongoose from "mongoose"
import CircularJSON from 'circular-json';
import jwt from "jsonwebtoken"
import { response } from "express"




const generateAccessToeknandRefreshTokens=async(userId)=>{
  try{
  const user=await User.findById(userId)

 const accesstoekn= user.generateAccessToekn() 
 console.log("...........",accesstoekn)
 const refreshToken=user.generateRefreshToekn()
 console.log("..reffef.........",refreshToken)
 user.refreshToken=refreshToken
 await user.save({validateBeforeSave:false})

 return {accesstoekn,refreshToken}
  }

  catch(error){
    throw ApiError(500,"Something went wrong whiel generating refresh and access")
  }
}
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
 console.log("avatr",avatarLocalPath)

//  const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
//  console.log("localcover",coverImageLocalPath)
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
if(!avatar){
    throw new ApiError(400,"Avatar file is required")
}


const user=await User.create({fullname,
 avatar:avatar?.url,
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




const loginuser=asyncHandler(async(req,res)=>{
   const {username,email,password}=req.body;
   if(!username && !email){
    throw new ApiError(400,"username or password is required")

   }

  const user= await User.findOne({
    $or:[{username},{email}]
   })

   if(!user){
    throw  new ApiError(404,"User does not register");
   }
   const isPasswordvalid=await user.isPasswordCorrect(password)
   
   if(!isPasswordvalid){
    throw new ApiError(401,"Invalid user credentils");}

    const {accesstoekn,refreshToken} =await generateAccessToeknandRefreshTokens(user._id)
    const  loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const option={
      httpOnly:true,
      secure:true

    }
    return res.status(200)
    .cookie("accesstokn",accesstoekn,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
      new ApiError(
         200,
         {
            user:loggedInUser,accesstoekn,refreshToken
         },
         "user logged in succcessfully"
      )
    )
       
   }


)

const logoutUser=asyncHandler(async (req,res)=>{
  
 await User.findByIdAndUpdate(
   req.user._id,
   {
      $set:{
         refreshToken:undefined
      }
   },
   {
      new :true
   }
 )
 const option={
   httpOnly:true,
   secure:true

 }
 return res 
 .status(200)
 .clearCookie("accesstoekn",option)
 .clearCookie("refreshToken",option)
 .json(new ApiError(200,{},"User Logged out"))
   
})

const refreshAccessToeken=asyncHandler(async(req,res)=>{
   const incomingrefreshtoken=req.cookies.refreshToken || req.body.refreshToken

   if(!incomingrefreshtoken){
      throw new ApiError(401,"Unaithorized request")
   }
 try {
    const decodedtoken= jwt.verify(incomingrefreshtoken,
        process.env.REFRESH_TOKEN_SECRET)
  
      const user= await User.findById(decodedtoken?._id);
      if(!user){
        throw new ApiError(401,"Invalid refresh token")
      }
      if(incomingrefreshtoken!==user?.refreshToken){
        throw new ApiError(401,"refresh token is expired or used")
      }
  
      const option={
        httpOnly:true,
        secure:true
      }
  
  
   const {accesstoekn,newrefreshToken}=  await generateAccessToeknandRefreshTokens(user._id)
     return res.status(200)
     .cookie("accesstokn",accesstoekn,option)
     .cookie("refreshToken",newrefreshToken,option)
     .json( new ApiResponse(
        200,
        {
           accesstoekn,refreshToken:newrefreshToken
        },
        "Acess toekn refreshed"
     ))
 } catch (error) {
   throw ApiError(401,error?.message || "Invalid refreh token")
 }
})


const changeCurrentpassword=asyncHandler(async(req,res)=>{
const {oldpassword,newpassword}=req.body
const user=await User.findById(req.user?._id)
const isPasswordCorrect=await user.isPasswordCorrectt(oldpassword)
if(!isPasswordCorrect){
   throw ApiError(404,"Invalid old  Passowrd")
}
user.password=newpassword
await user.save({validateBeforeSave:false})
return res.status(200)
.json(new ApiResponse(200,{},"su"))

})

const getcurrentuser=asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(200,req.user,"current user fectched successfully")

})
const upadteAccountDetail=asyncHandler(async(req,res)=>{
   const {fullname,email,}=req.body
   if(!fullname || !email){
      throw new ApiError(400,"All fileds required ")

   }
  const user= await User.findByIdAndUpdate(req.user?._id,
      {$set:{
         fullname,
         email:email
      }},
      {new:true}
   ).select("-password")
   return res.status(200)
   .json( new ApiResponse(200,user,"Account details update successfully"))
})


const updateUseravatar=asyncHandler(async(req,res)=>{
   const avatarlocalpath=req.file?.path
   if(!avatarlocalpath){
      throw new ApiError(400,"Avatar file is missing")
    
   }
 const avatar=  await uploadcloundinary(avatarlocalpath)
 if(!avatar.url){
   throw new ApiError(400,"Error while uploading while on avatar")
 
}
const user=await User.findByIdAndUpdate(
   req.user?._id,
   {$set:{
      avatar:avatar.url,
   }},
   {new:true}
).select("-password")
return res
.status(200)
.json(new ApiResponse(200,user,"Avatar image update successfully"))

})


const updateUsercoverImage=asyncHandler(async(req,res)=>{
   const coverimagelocalpath=req.file?.path
   if(!coverimagelocalpath){
      throw new ApiError(400,"coverimage file is missing")
    
   }
 const coverImage=  await uploadcloundinary(coverimagelocalpath)
 if(!coverImage.url){
   throw new ApiError(400,"Error while uploading while on coverimage ")
 
}
const user=await User.findByIdAndUpdate(
   req.user?._id,
   {$set:{
      coverImage:coverImage.url,
   }},
   {new:true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200,user,"Cover image update successfully"))

})
export {registerUser,loginuser,
   logoutUser,refreshAccessToeken,
   getcurrentuser,changeCurrentpassword,
   upadteAccountDetail,updateUseravatar,
   updateUseravatar,updateUsercoverImage}