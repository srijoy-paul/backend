const express=require('express');
const router=express.Router();

const {Request,Response}=require("express");

const pool=require("../config/db");
const jwtCheck=require('../middlewares/auth');
const parseJWT=require('../middlewares/parseJWT')

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

router.put("/update",parseJWT,async(req:any,res:any)=>{
    if (req.body !== null) {
        const { name, addressline1, country, city } = req.body;
        res.status(200).json({mssg:"Successfully updates",details:{name,addressline1,country,city}})
        console.log(req.user);
        const updateUserDetails=await pool.query('UPDATE userinfo SET name=$1,addressline1=$2,city=$3,country=$4 WHERE auth0id=$5 RETURNING *',[name,addressline1,country,city,req.user.auth0id]);
        console.log(updateUserDetails.rows[0]);

        res.status(200).json({mssg:"Details Updated Successfully."});
        
    }
    
})

module.exports=router;
export{}