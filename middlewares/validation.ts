const {body,validationResult}=require('express-validator');

const handleValidationErrors=async(req:any,res:any,next:any)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
}
    next();
};

const validateUserRequest=[
    body("name").isString().notEmpty().withMessage("Name must be a string."),
    body("addressline1").isString().notEmpty().withMessage("Addressline1 must be a string."),
    body("city").isString().notEmpty().withMessage("City must be a string."),
    body("country").isString().notEmpty().withMessage("Country must be a string."),
    handleValidationErrors,
]

module.exports=validateUserRequest;