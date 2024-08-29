const asyncHandler=(requesthandler)=>{
   (req,res,next)=>{
    Promise.resolve(requesthandler(req.res.next))
   }
}

export {asyncHandler}

