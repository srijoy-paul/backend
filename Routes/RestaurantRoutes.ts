const express = require("express");
const router = express.Router();

const pool=require('../config/db');

router.get("/search/:city", async (req: any, res: any) => {
  try {
    const cityParam = req.params.city;
    // console.log(cityParam);  
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastupdated";
    const page=parseInt(req.query.page as string) || 1;

    console.log(sortOption);
    

    //pagination logic
    const pageSize=10;
    const skip=(page-1)*pageSize;
    


    const query:any={};
    // .toLowerCase()
    query["city"]=cityParam; //to handle casing
    

    const availableRestaurants= await pool.query(`SELECT * FROM restaurant WHERE city=$1 ORDER BY ${sortOption} LIMIT $2 OFFSET $3;`,[query.city,pageSize,skip]);
    console.log(availableRestaurants.rowCount);

    if(availableRestaurants.rowCount===0){
        return res.json({data:[],pageParameters:{}});
    }

    const queryParams=[query.city];
    let queryString='SELECT * FROM restaurant WHERE city=$1';
    
    let cuisinesRes;
    if(selectedCuisines!=""){
      const cuisinesArray=selectedCuisines.split(",").map((cuisine)=>cuisine);
      queryParams.push(cuisinesArray);
      // queryString += ` AND cuisines IN (${cuisinesArray.map((_, index) => `$${index + 2}`).join(',')});`;
      queryString+=` AND EXISTS (
        SELECT 1 FROM unnest(cuisines) AS c
        WHERE c = ANY($2::text[])
      ) ORDER BY ${sortOption};`
      cuisinesRes = await pool.query(queryString, queryParams);
    }
    // console.log("cuisines query",queryString,queryParams);
    

    // console.log("selectedCuisines Query-->",cuisinesRes.rows);

    let searchQueryRes;
    if(searchQuery!=""){
      searchQueryRes=await pool.query(`SELECT * FROM restaurant WHERE city=$1 AND (restaurantname = $2 OR EXISTS (SELECT 1 FROM unnest(cuisines) AS c WHERE c = $2)) ORDER BY ${sortOption};`,[query.city,searchQuery]);
    }
    

    // console.log("SearchQuery-->",searchQueryRes.rows);

    let result;
    result=availableRestaurants.rows;
    if(cuisinesRes!=undefined){
      console.log("cuisinesRes");
      
      result=cuisinesRes.rows;
    }if(searchQueryRes!=undefined){
      console.log("searchQueryRes",searchQuery);
      
      result=searchQueryRes.rows
    }
    console.log("result info",result,result.length);
    

    const total=result.length;
    
    res.json({data:result,pageParameters:{
      total:total,
      page:1,
      pages:Math.ceil(total/pageSize)
    }});
    // res.send("success");
    
  } catch (e) {
    console.log(e);
    res.status(500).json({message:"Something went wrong"});
    
  }
});

module.exports = router;
export{}
