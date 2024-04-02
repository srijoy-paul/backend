const express=require('express');
const cors=require('cors');
const userRouter = require('./Routes/UserRoutes');
const restaurantRouter=require('./Routes/RestaurantRoutes');
const cloudinary=require("cloudinary").v2;

// coudinary setup
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secrect:process.env.CLOUDINARY_API_SECRECT_KEY
});

const app=express();

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
app.use("/api/v1/restaurant",userRouter);

const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});