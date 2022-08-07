const express = require("express");
const router = express.Router()
const userController = require("../src/controller/userController");
const productController = require("../src/controller/productController");
const {authentication,Authorization} = require("../src/middleware/auth");
const cartController = require("../src/controller/cartController");
const orderController = require("../src/controller/orderController");



// API-User

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.get("/user/:userId/profile", authentication,Authorization,userController.getUserDetails);
router.put("/user/:userId/profile",authentication,Authorization,userController.update);

// API-Product

router.post("/products", productController.createProduct);
router.get("/products", productController.getProduct);
router.get("/products/:productId", productController.getProductById);
router.put("/products/:productId", productController.updateProduct);
router.delete("/products/:productId", productController.deleteProduct);

// API-Cart

router.post("/users/:userId/cart",authentication,cartController.createCart);
router.put("/users/:userId/cart",authentication,cartController.updateCart);
router.get("/users/:userId/cart",authentication,Authorization,cartController.getCartDetails);
router.delete("/users/:userId/cart",authentication,Authorization,cartController.deleteCart);

// API-Order-

router.post("/users/:userId/orders",authentication,orderController.createOrder);
router.put("/users/:userId/orders",authentication,orderController.updateOrder);


module.exports = router;