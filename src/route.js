const express = require("express");
const router = express.Router();

// const midW = require("../middlewares/auth");
// const booksController = require("../controllers/booksController");
// const reviewsController = require("../controllers/reviewsController");
const userController = require("../src/controller/userController");


router.get("/user/:userId/profile",userController.getUserDetails);

module.exports = router;