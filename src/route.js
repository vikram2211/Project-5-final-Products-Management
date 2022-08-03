const express = require("express");
const router = express.Router()
const userController = require("../src/controller/userController");
const productController = require("../src/controller/productController");
const {authentication,Authorization} = require("../src/middleware/auth");
const cartController = require("../src/controller/cartController");


// API-User

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.get("/user/:userId/profile", authentication,userController.getUserDetails);
router.put("/user/:userId/profile",authentication,Authorization,userController.update);

// API-Product

router.post("/products", productController.createProduct);
router.get("/products", productController.getProduct);
router.get("/products/:productId", productController.getProductById);
router.put("/products/:productId", productController.updateProduct);
router.delete("/products/:productId", productController.deleteProduct);

// API-Cart

router.post("/users/:userId/cart", cartController.createCart);
// router.get("/users/:userId/cart ", cartController.updateCart);
router.put("/users/:userId/cart", cartController.getCartDetails);
// router.delete("/users/:userId/cart", cartController.deleteCart);

module.exports = router;