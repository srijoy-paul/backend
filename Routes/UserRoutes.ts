const express=require('express');
const router=express.Router();

const pool=require("../config/db");
const jwtCheck=require('../middlewares/auth');

router.post("/signup",jwtCheck,async(req:any,res:any)=>{
try {
    const {auth0id,email} =req.body;
    const existingUser=await pool.query('SELECT * FROM userinfo WHERE auth0id=$1',[auth0id]);

    if(existingUser.rows.length!==0){
        return res.status(200).json({status:"ok",message:"User already exists."});
    }
    const newUser=await pool.query("INSERT INTO userinfo(auth0id,email) VALUES($1,$2) RETURNING *",[auth0id,email]);

    res.status(201).json(newUser.rows[0]);

} catch (error) {
    console.log(error);

    res.status(500).json({status:"error",message:"Error while creating your user account."});
    
}
});


module.exports=router;
export{}