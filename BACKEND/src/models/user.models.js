import mongoose ,{Schema}from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowecase:true,


    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
      
        lowecase:true,


    },
    fullname:{
        type:String,
        required:true,
       
        trim:true,
        index:true,

    },
    avatar:{
        type:String,
     
 

    },
    coverImage:{
        type:String,
        

    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Vedio",
    }],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshtoekn:{
        type:String,
    }

},{timestamps:true})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password,10)
    next()
})



userSchema.methods.isPasswordCorrect = async function(password) {
   
    return await bcrypt.compare(password, this.password);

};
userSchema.methods.generateAccessToekn=function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },
process.env.ACCESS_TOKEN_SECREST,

{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
})
}

userSchema.methods.generateRefreshToekn=function(){
  return  jwt.sign({
        _id:this._id,
        
    },
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
})
}
export const User=mongoose.model("User",userSchema)
