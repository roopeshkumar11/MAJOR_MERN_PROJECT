const asyncHandler=(requesthandler)=>{
   return (req,res,next)=>{
    Promise.resolve(requesthandler(req,res,next))
   }
}

export {asyncHandler}

