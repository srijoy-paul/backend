const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const jwtCheck = require("../middlewares/auth");
const parseJWT = require("../middlewares/parseJWT");

router.post(
  "/:restaurantid/createReview",
  jwtCheck,
  parseJWT,
  async (req: any, res: any) => {
    console.log("User from review", req.user);
    console.log(req.params.restaurantid);
    const { rating, comment } = req.body;
    const existingRestaurant = await pool.query(
      "SELECT * FROM restaurant WHERE restaurantid=$1",
      [req.params.restaurantid]
    );
    if (!existingRestaurant) {
      return res.status(404).json({ message: "Restaurant Doesn't Exist" });
    }
    console.log(
      "Restaurant Det. from createReview",
      existingRestaurant.rows[0]
    );
    const newReview = {
      restaurant_id: req.params.restaurantid,
      user_id: req.user.id,
      rating: rating,
      comment: comment,
      created_at: new Date(),
    };
    const createdReview = await pool.query(
      "INSERT INTO reviews(restaurant_id,user_id,rating,comment,created_at)VALUES($1,$2,$3,$4,$5) RETURNING *",
      [
        newReview.restaurant_id,
        newReview.user_id,
        newReview.rating,
        newReview.comment,
        newReview.created_at,
      ]
    );
    if (!createdReview) {
      return res
        .status(401)
        .json({ message: "Problem while creating the Review." });
    }
    console.log(createdReview.rows[0]);
    return res.status(201).json(createdReview.rows[0]);
  }
);

router.get("/:restaurantid/getAllReviews", async (req: any, res: any) => {
  const allReviews = await pool.query(
    "SELECT * FROM reviews WHERE restaurant_id=$1",
    [req.params.restaurantid]
  );
  if (!allReviews) {
    return res.json({
      message: "Problem while Getting all the Reviews for this Restaurant.",
    });
  }
  console.log(allReviews.rows[0]);
  return res.json(allReviews.rows);
});
module.exports = router;
export {};
