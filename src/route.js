const express = require("express");
const router = express.Router()
const userController = require("../src/controller/userController");

router.post("/register",userController. createUser);
router.post("/login",userController.login);
router.get("/user/:userId/profile",userController.getUserDetails);
router.put("/user/:userId/profile",userController.update);

module.exports = router;