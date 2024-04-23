const express = require("express");
const router = express.Router();

const pool=require('../config/db');

router.post("/restaurant/:city", async (req: any, res: any) => {
  try {
    const cityParam = req.params.city;
    // console.log(cityParam);

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page=parseInt(req.query.page as string) || 1;


    const query:any={};
    // .toLowerCase()
    query["city"]=cityParam; //to handle casing
    console.log(query.city);
    

    const availableRestaurants= await pool.query('SELECT * FROM restaurant WHERE city=$1;',[query.city]);
    console.log(availableRestaurants.rowCount);

    if(availableRestaurants.rowCount===0){
        return res.status(404).json([]);
    }

    const queryParams=[query.city];
    let queryString='SELECT * FROM restaurant WHERE city=$1';
    
    if(selectedCuisines){
      const cuisinesArray=selectedCuisines.split(",").map((cuisine)=>cuisine);
      queryParams.push(cuisinesArray);
      // queryString += ` AND cuisines IN (${cuisinesArray.map((_, index) => `$${index + 2}`).join(',')});`;
      queryString+=` AND EXISTS (
        SELECT 1 FROM unnest(cuisines) AS c
        WHERE c = ANY($2::text[])
      );`
    }
    
    // console.log("query",queryString);
    // console.log("cuisine Array",queryParams);
    // console.log("cuisine Array",cuisinesArray);

    console.log(queryString,queryParams);
    

    const cuisinesRes = await pool.query(queryString, queryParams);

    console.log(cuisinesRes.rows);

    if(searchQuery){
      await pool.query('SELECT * FROM restaurant WHERE city=$1 AND (restaurantname ILIKE %$2% OR EXISTS(SELECT 1 FROM unnest(cuisines) AS c WHERE c ILIKE %$2%',[query.city,])
    }
    
    
    

    res.send("success");
    
  } catch (e) {
    console.log(e);
    res.status(500).json({message:"Something went wrong"});
    
  }
});

module.exports = router;
export{}
