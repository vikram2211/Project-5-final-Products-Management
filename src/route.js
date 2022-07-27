const express = require("express");
const router = express.Router()
const userController = require("../src/controller/userController");
const productController = require("../src/controller/productController");

// API-User

router.post("/register",userController.createUser);
router.post("/login",userController.login);
router.get("/user/:userId/profile",userController.getUserDetails);
router.put("/user/:userId/profile",userController.update);

// API-Product

router.post("/products",productController.createProduct);
// router.get("/products",productController.getProductDetails);
// router.get("/products/:productId",productController.getProductsById);
// router.put("/products/:productId",productController.updateProductById);
// router.delete("/products/:productId",productController.deleteProductById);

module.exports = router;