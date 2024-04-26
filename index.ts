import bodyParser from "body-parser";

require('dotenv').config();
const express=require('express');
const cors=require('cors');
// const cloudinary = require('cloudinary').v2;
// require("../models/userModel");
// require("../models/restaurantModel");
const userRouter = require('./Routes/UserRoutes');
const manageRestaurantRouter=require('./Routes/ManageRestaurantRoutes');
const restaurantRouter=require('./Routes/RestaurantRoutes');

const app=express();
// coudinary setup
// cloudinary.config({
//     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret:process.env.CLOUDINARY_API_SECRET_KEY,
//     secure:true
// });

// module.exports= cloudinary;



app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

app.get('/health',(req:any,res:any)=>{
    try {
        res.send({message:"Server health is ok"});
    } catch (error) {
        
    }
})

app.use("/api/v1/user",userRouter);
app.use("/api/v1/restaurant",manageRestaurantRouter);
app.use("/api/v1/restaurants",restaurantRouter);

const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});