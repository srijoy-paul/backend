require('dotenv').config();
const express=require('express');
const cors=require('cors');
// const cloudinary = require('cloudinary').v2;
const userRouter = require('./Routes/UserRoutes');
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
app.use("/api/v1/restaurant",restaurantRouter);

const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});