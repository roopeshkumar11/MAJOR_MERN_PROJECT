import mongoose,{Schema} from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{
        typeof:Schema.Types.ObjectId, // one who is subsribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
   
}, {timestamps:true})




export const Subscription=mongoose.model("Subscription",subscriptionSchema)