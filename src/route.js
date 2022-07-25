const express = require("express");
const router = express.Router()
const userController = require("../src/controller/userController");

router.post("/register",userController. createUser);
router.get("/user/:userId/profile",userController.getUserDetails);

module.exports = router;