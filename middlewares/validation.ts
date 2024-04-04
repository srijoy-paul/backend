const {body,validationResult}=require('express-validator');
const { ValidationChain } =require('express-validator');

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

const validateRestaurantRequest=[
    body("restaurantname").notEmpty().withMessage("Restro name is required"),
    body("city").notEmpty().withMessage("city is required"),
    body("country").notEmpty().withMessage("country is not defined"),
    body("deliveryprice").isFloat({min:0}).withMessage("Delivery price must be a positive number."),
    body("estimateddeliverytime").isTime({
        hourFormat: 'hour12',
        mode: 'withSeconds'
      }).withMessage("Estimated Delivery time must contain some time value."),
    body("cuisines").isArray().withMessage("cuisines should contain items in list.").not().isEmpty().withMessage("cuisines list should not be empty"),
    body("menuitems").isArray().withMessage("menuitems should not be empty and should contain a list."),
    body("menuitems.*.name").notEmpty().withMessage("menu item should have a name"),
    body("menuitems.*.price").notEmpty().withMessage("menu item should have a price"),
    handleValidationErrors
]

module.exports={validateUserRequest,validateRestaurantRequest};