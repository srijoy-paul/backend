const pool=require("../config/db");
const {Request,Response,NextFunction}=require("express");
const jwt=require("jsonwebtoken");
const {JwtPayload}=require("jsonwebtoken");

declare global{
    namespace Express{
        interface Request{
            auth0id:string;
            email:string
            name:string
            addressline1:string
            city:string
            country:string
        }
    }
}

const parseJWT=async(req:any,res:any,next:any)=>{
    // console.log("logging from parseJWT",req.body);
    
    const {authorization}=req.headers;
    if(!authorization){
        return res.status(401).json({err:"You don't have authorization to access further."})
    }
    
    // ex: `Bearer eqljsflnxlmaeonalmzohwnondfoamlchpuyrtyaoddlma`
    const token=authorization.split(" ")[1];
    console.log(token);
    
    if(!token){
        return res.status(401).json({err:"You are not authorized to access further."})
    }

    console.log("Authorized and having valid token");
    

    try {
        const decoded=jwt.decode(token) as typeof JwtPayload;
        console.log("after decoding token: ",decoded);

        const auth0id=decoded.sub;

        const user=await pool.query('SELECT * FROM userinfo WHERE auth0id=$1',[auth0id]);
        // console.log(user.rows[0]);
        

        if(user.rows.length===0){
            return res.status(404).json({err:"User not found"});
        }

        req.user=user.rows[0];
        next();
        
    } catch (error) {
        console.log(error);

        return res.status(500).send(error);
        
    }
}

module.exports=parseJWT;
export{}