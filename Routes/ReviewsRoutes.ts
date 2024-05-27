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
    try {
      console.log("User from review", req.user);
      console.log(req.params.restaurantid);
      const { rating, comment = "" } = req.body;
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
    } catch (error) {
      console.log(error);
    }
  }
);

router.get("/:restaurantid/getAllReviews", async (req: any, res: any) => {
  try {
    const { page = 1, sortOption = "new" } = req.query;
    const limit = 5;
    const offset = (page - 1) * limit;

    if (page == 2) console.log("scroll page num", page);

    let orderByClause = "created_at DESC";
    if (sortOption === "old") {
      orderByClause = "created_at ASC";
    }

    const allReviews = await pool.query(
      `SELECT * FROM reviews WHERE restaurant_id=$1 ORDER BY ${orderByClause} LIMIT $2 OFFSET $3`,
      [req.params.restaurantid, limit, offset]
    );
    if (!allReviews) {
      return res.json({
        message: "No Reviews Availabe.",
      });
    }
    for (const review of allReviews.rows) {
      const userName = await pool.query(
        "SELECT name FROM userinfo where id=$1",
        [review.user_id]
      );
      review["username"] = userName.rows[0].name;
    }
    // console.log(allReviews.rows[0]);
    const totalReviews = await pool.query(
      "SELECT COUNT(*) AS total_reviews FROM reviews WHERE restaurant_id = $1;",
      [req.params.restaurantid]
    );
    console.log("total", totalReviews.rows[0].total_reviews);

    return res.status(201).json(allReviews.rows);
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Problem while Getting the Reviews for this Restaurant.",
    });
  }
});
module.exports = router;
export {};
