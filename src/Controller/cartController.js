const cartModel = require("../model/cartModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const { find } = require("../model/cartModel");


const createCart = async function (req, res) {

}
const updateCart = async function (req, res) {
    let {cartId,productId, removeProduct } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cartId))
        return res.status(400).send({ status: false, message: "please enter valid cartId" })
    if (!mongoose.Types.ObjectId.isValid(productId))
        return res.status(400).send({ status: false, message: "please enter valid cartId" })

    let checkCartExist = await cartModel.findOne({_id:cartId,isDeleted:false}) 
    if(!checkCartExist)  return res.status(404).send({ status: false, message: "no cart found with this id " })  
    let checkProductExist = await cartModel.findOne({_id:productId,isDeleted:false}) 
    if(!checkProductExist)  return res.status(404).send({ status: false, message: "no product found with this id " })  
    

    if(!(removeProduct==0||removeProduct==1))
    return res.status(400).send({ status: false, message: "enter 0 if product is to be removed or  enter 1 if its quantity has to be decremented by 1" })

    // let isProductInCart = await cartModel.findOne({ items: { $elemMatch: { productId:productId } } })
    // if (!isProductInCart) {
    //     return res.status(400).send({ status: false, message: `The product with this id : ${productId}  does not exists in the cart` })
    // }

    let findProduct = checkCartExist.items.find(x => x.productId.toString() === productId)
    if (!findProduct) {
        return res.status(400).send({ status: false, message: `The product with this id : ${productId}  does not exists in the cart` })
    }    

    if (removeProduct === 0) {
        let totalAmount = checkCartExist.totalPrice - (checkProductExist.price * findProduct.quantity) 

        await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })

        let quantity = checkCartExist.totalItems - 1
        let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })

        return res.status(200).send({ status: true, message: `the product from cart with id ${productId} is been removed`, data: data })
    }

    // decrement quantity
    let index = checkCartExist.items.indexOf(findProduct);
   
    if (removeProduct == 1) {

        checkCartExist.items[index].quantity -= 1;
        checkCartExist.totalPrice = checkCartExist.totalPrice - checkProductExist.price.toFixed(2)
        if (checkCartExist.items[index].quantity == 0) {

            checkCartExist.items.splice(index, 1)
        }
        checkCartExist.totalItems = checkCartExist.items.length
        checkCartExist.save()
    }
    return res.status(200).send({ status: true, message: "Data updated successfuly", data: checkCartExist })
}
const getCartDetails = async function (req, res) {

}
const deleteCart = async function (req, res) {

}


module.exports = { createCart, updateCart, getCartDetails, deleteCart }