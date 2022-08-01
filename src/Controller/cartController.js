const cartModel = require("../model/cartModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const productModel = require("../model/productModel")
const userModel = require("../model/userModel");

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

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        //checking if the cart is present with this userId or not
        let findCart = await cartModel.findOne({ userId: userId });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found with this ${userId} userId` });

        if (findCart.items.length == 0) {
            return res.status(400).send({ status: false, message: "Cart is already empty" });
        }

        await cartModel.updateOne({ _id: findCart._id },
            { items: [], totalPrice: 0, totalItems: 0 });

        return res.status(200).send({ status: false, message: " cart Deleted Sucessfully" });


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

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


 module.exports = { createCart, updateCart, getCartDetails, deleteCart } 
