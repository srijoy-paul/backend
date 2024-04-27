const express = require("express");
// const {Request,Response}=require('express');
const router = express.Router();
const crypto = require("crypto");
const pool = require("../config/db");
const multer = require("multer");
const jwtCheck = require("../middlewares/auth");
const parseJWT = require("../middlewares/parseJWT");
const { validateRestaurantRequest } = require("../middlewares/validation");
// const cloudinary=require("../index");
const cloudinary = require("cloudinary").v2;
// const upload = require("../utils/FileUpload");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
  secure: true,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

router.post(
  "/createRestaurant",
  // validateRestaurantRequest,
  jwtCheck,
  parseJWT,
  upload.single("imageFile"),
  async (req: any, res: any) => {
    try {
      console.log("recieved request -->>");
      // console.log("logging req",req);
      console.log("logging req", req.body);

      const {
        restaurantname,
        city,
        country,
        deliveryprice,
        estimateddeliverytime,
        cuisines,
        menuitems,
      } = req.body;
      console.log("logging the req.body", req.body);

      console.log(
        "logging the request body",
        restaurantname,
        country,
        estimateddeliverytime,
        deliveryprice,
        cuisines,
        menuitems
      );
      // console.log("Usr id", req.user);

      const existingRestaurant = await pool.query(
        "SELECT * FROM restaurant WHERE userid=$1",
        [req.userid]
      );
      // console.log("user having a existing restaurant or not",existingRestaurant.rows);

      if (existingRestaurant.rows.length != 0) {
        return res
          .status(409)
          .json({ message: "You are already having a restaurant registered" });
      }
      // console.log("logging req file", req.file);

      const image = req.file as Express.Multer.File;
      const base64Image = Buffer.from(image.buffer).toString("base64");
      const dataURI = `data:${image.mimetype};base64,${base64Image}`;

      const uploadResponse = await cloudinary.uploader.upload(dataURI);

      menuitems.map(
        async (
          item: { name: string; price: string; id: string },
          index: number
        ) => {
          console.log(`item ${index}`, item.name, item.price);
          item.id = crypto.randomBytes(5).toString("hex");
        }
      );
      // menuitems.id=JSON.stringify(crypto.randomBytes(5).toString('hex'));
      console.log("menuitmes", menuitems);

      const newRestaurantData = {
        userid: req.user.id,
        restaurantname: restaurantname,
        city: city,
        country: country,
        deliveryprice: deliveryprice,
        estimateddeliverytime: estimateddeliverytime,
        cuisines: cuisines,
        menuitems: menuitems,
        imageurl: uploadResponse.url,
        lastupdated: new Date(),
      };

      const newRestaurant = await pool.query(
        "INSERT INTO restaurant(userid,restaurantname,city,country,deliveryprice,estimateddeliverytime,cuisines,menuitems,imageurl,lastupdated)VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;",
        [
          newRestaurantData.userid,
          newRestaurantData.restaurantname,
          newRestaurantData.city,
          newRestaurantData.country,
          newRestaurantData.deliveryprice,
          newRestaurantData.estimateddeliverytime,
          newRestaurantData.cuisines,
          newRestaurantData.menuitems,
          newRestaurantData.imageurl,
          newRestaurantData.lastupdated,
        ]
      );

      console.log("Created Restaurant", newRestaurant.rows[0]);

      if (!newRestaurant) {
        return res
          .status(501)
          .json({ message: "Unable to create a Restaurant." });
      }

      return res.status(201).json({
        message: "Restaurant created",
        createdResturant: newRestaurant.rows[0],
      });
    } catch (error) {
      console.log("hey", error);

      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/getInfo", jwtCheck, parseJWT, async (req: any, res: any) => {
  try {
    console.log("hi", req.user);

    const existingRestaurant = await pool.query(
      "SELECT * FROM restaurant WHERE userid=$1",
      [req.user.id]
    );

    if (existingRestaurant.rows.length == 0) {
      return res
        .status(401)
        .json({ message: "You don't have a restaurant yet." });
    }
    // console.log(existingRestaurant.rows[0]);

    return res
      .status(200)
      .json({ message: "ok", restaurantData: existingRestaurant.rows[0] });
  } catch (error) {
    console.log(error);

    return res
      .status(501)
      .json({ message: "Couldn't able to fetch restaurant data." });
  }
});

router.put(
  "/updateInfo",
  upload.single("imageFile"),
  // validateRestaurantRequest,
  jwtCheck,
  parseJWT,
  async (req: any, res: any) => {
    try {
      const {
        restaurantname,
        city,
        country,
        deliveryprice,
        estimateddeliverytime,
        cuisines,
        menuitems,
      } = req.body;
      console.log("hello",restaurantname,country,city,deliveryprice,estimateddeliverytime,cuisines,menuitems);
      

      const defaultImageUrl = await pool.query(
        "SELECT imageurl FROM restaurant WHERE userid=$1",
        [req.user.id]
      );
      console.log("default cover image",defaultImageUrl.rows[0].imageurl);

      let imageurl = defaultImageUrl.rows[0].imageurl;
      if (req.file) {
        const image = req.file as Express.Multer.File;
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.uploader.upload(dataURI);
        imageurl = uploadResponse.url;
      }

      const updatedRestaurantInfo = {
        // userid: req.user.id,
        restaurantname: restaurantname,
        city: city,
        country: country,
        deliveryprice: deliveryprice,
        estimateddeliverytime: estimateddeliverytime,
        cuisines: cuisines,
        menuitems: menuitems,
        imageurl: imageurl,
        lastupdated: new Date(),
      };
      const updatedRestaurant = await pool.query(
        "UPDATE restaurant SET restaurantname=$1,city=$2,country=$3,deliveryprice=$4,estimateddeliverytime=$5,cuisines=$6,menuitems=$7,imageurl=$8,lastupdated=$9 WHERE userid=$10",[
          updatedRestaurantInfo.restaurantname,
          updatedRestaurantInfo.city,
          updatedRestaurantInfo.country,
          updatedRestaurantInfo.deliveryprice,
          updatedRestaurantInfo.estimateddeliverytime,
          updatedRestaurantInfo.cuisines,
          updatedRestaurantInfo.menuitems,
          updatedRestaurantInfo.imageurl,
          updatedRestaurantInfo.lastupdated,
          req.user.id
        ]
      );

      console.log(updatedRestaurant.rows[0]);
      return res.status(200).json({UpdatedInfo:updatedRestaurant.rows[0]});


    } catch (error) {
      console.log(error);
      return res.status(501).json({ message: "something went wrong" });
    }
  }
);
module.exports = router;
export {};
