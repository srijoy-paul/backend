const express = require("express");
const router = express.Router();

const upload = require("../utils/FileUpload");

router.post(
  "/createResturant",
  upload.single("imageFile"),
  async (req, res) => {}
);
module.exports = router;
export {};
