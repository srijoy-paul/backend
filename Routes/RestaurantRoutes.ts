const express = require("express");
// const {Request,Response}=require('express');
const router = express.Router();
const pool=require("../config/db");
const multer = require("multer");
// const cloudinary=require("../index");
const cloudinary = require('cloudinary').v2;
// const upload = require("../utils/FileUpload");
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET_KEY,
  secure:true
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/createRestaurant",
  upload.single("imageFile"),
  async (req:any, res:any) => {
    try {
      const {
        restaurantname,
        city,
        country,
        deliveryprice,
        estimateddeliverytime,
        cuisines,
        menuitems
      } = req.body;
      console.log("Values: -->>",restaurantname,
        city,
        country,
        deliveryprice,
        estimateddeliverytime,
        cuisines,
        menuitems);
      

      const existingRestaurant = await pool.query(
        "SELECT * FROM restaurant WHERE userid=$1",
        [req.userid]
      );
      console.log("user having a existing restaurant or not",existingRestaurant.rows);
      

      if (existingRestaurant.rows.length != 0) {
        return res
          .status(409)
          .json({ message: "You are already having a restaurant registered" });
      }

      const image = req.file as Express.Multer.File;
      const base64Image = Buffer.from(image.buffer).toString("base64");
      const dataURI = `data:${image.mimetype};base64,${base64Image}`;

      const uploadResponse = await cloudinary.uploader.upload(dataURI);

      const newRestaurantData = {
        userid: req.userid,
        restaurantname: restaurantname,
        city: city,
        country: country,
        deliveryprice: deliveryprice,
        estimateddeliverytime: estimateddeliverytime,
        cuisines: cuisines,
        menuitems: menuitems,
        imageurl: uploadResponse.url,
        lastupdated:new Date(),
      };

      const newRestaurant = await pool.query("INSERT INTO restaurant(userid,restaurantname,city,country,deliveryprice,estimateddeliverytime,cuisines,menuitems,imageurl,lastupdated)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",[newRestaurantData.userid,newRestaurantData.restaurantname,newRestaurantData.city,newRestaurantData.country,newRestaurantData.deliveryprice,newRestaurantData.estimateddeliverytime,newRestaurantData.cuisines,newRestaurantData.menuitems,newRestaurantData.imageurl,newRestaurantData.lastupdated]);

      console.log(newRestaurant.rows[0]);
      
      if(!newRestaurant){return res.status(501).json({message:"Unable to create a Restaurant."})};

      return res.json({message:'Restaurant created',createdResturant:newRestaurant.rows[0]})
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);
module.exports = router;
export {};
