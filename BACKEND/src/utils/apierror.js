class ApiERRor extends Error{
    constructor(
        statusCode,
        message="SOmething went Wrong",
        error=[],
        stack=""
    )
    {
        super(message),
        this.statusCode=statusCode,
        this.data=null,
        this.message=message,
        this.success=false,
        this.error=this.error

        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }


    }
}
export {ApiERRor}