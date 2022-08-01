const cartModel = require("../model/cartModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const userModel = require("../model/userModel");
const CartModel = require("../model/cartModel");



const getCartDetails = async function (req, res) {

    try {
        let userId = req.params.userId
    
    
        let userFound = await userModel.findById(userId)
    
        if (!userFound) { return res.status(404).send({ status: false, msg: 'user not found' }) }
    
        let userCheck= await cartModel.findOne({ userId: userId })
    
        if (!userCheck) {
          return res.status(400).send({ status: false, msg: 'cart not found' })
        }
        let update = userCheck.items
    
        let itemData = update.map(({ productId, quantity }) => {
          return { productId, quantity };
        })
        res.status(200).send({ status: true, msg: "success", data: { _id: userCheck._id, userId: userCheck.userId, items: itemData, totalPrice: userCheck.totalPrice, totalItems: userCheck.totalItems } })
      } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
      }
}


module.exports = { getCartDetails }