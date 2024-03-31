const express=require('express');
const cors=require('cors');
const userRouter = require('./Routes/UserRoutes');


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

const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});