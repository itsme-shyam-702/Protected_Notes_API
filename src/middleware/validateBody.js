const AppError = require('../utils/AppError');


const validateBody = (schema)=>{
    return (req,res,next)=>{
        const result = schema.safeParse(req.body);
    if (!result.success){
        const errors = result.error.flatten().fieldErrors;
        return next(new AppError (JSON.stringify(errors),422))
    }
    req.body = result.data
    next()
    }
}

module.exports = validateBody;