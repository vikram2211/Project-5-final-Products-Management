const cartModel = require("../model/cartModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const productModel = require("../model/productModel")
const userModel = require("../model/userModel");

const createCart = async function (req, res) {

    try {
        const userId = req.params.userId
        const requestBody = req.body;
        const { quantity, productId , cartId} = requestBody
        // let tokenUserId = req.userId;

        /*============  isValidrequestBody checks  any keys is present or not in request body===========*/
        
        if (Object.keys(requestBody).length==0) {
            return res.status(400).send({ status: false, message: "Please provide valid request body" })
        }
        /*======Checking  userId is Valid ObjectId or Not ==============================================*/
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" })
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid Product Id" })
        }
        if(cartId)
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide valid cart Id" })
        }
        /*========Whether the passed value is an integer (isInteger returns a Boolean)====================== */
        if(!quantity) quantity=1;
        const validQuantity = function isInteger(value) {
            if (value < 1) return false
            if (isNaN(Number(value))) return false //The isNaN() function determines whether a value is NaN or not.(NaN property is a value representing Not-A-Number.)
            if (value % 1 == 0) return true
        }
        if (typeof quantity != "number" || !validQuantity(quantity)) {
            return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero." })
        }
        // /*==================  Checking for User in DataBase ================================== */
        // const findUser = await userModel.findOne({ _id: userId,isDeleted: false })
        // if (!findUser) {
        //     return res.status(400).send({ status: false, message: `UseriD  doesn't exist (!  Entered userId ${userId})` })
        // }

        // if (findUser._id != tokenUserId) {
        //     return res.status(401).send({ status: false, message: "Unauthorized access! User's info doesn't match" }); //Authorisation

        // }
        /*==================  Checking for product present in dataBase ================================== */
        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(400).send({ status: false, message: `Product doesn't exist (Entered product Id  ${productId})` })
        }
        /* ===================Checking user has already created cart by taking user ID============================= */
        
        
        if (!cartId) {
          let items = [{ productId:  productId, quantity }]
            /*===========Destructuring for the response body.====================================================*/
            var cartData = {
                userId: userId,
                items: items,
                totalPrice: findProduct.price * quantity,
                totalItems: 1
            };
            /*======================================creating cart for User===================================*/
            const createCart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: 'Cart created successfully', data: createCart })
        }
    
    const findCartOfUser = await cartModel.findById(cartId)
    if(findCartOfUser.userId.toString() != userId)
    return res.status(400).send({ status:false , message:` this cart does not belong to this userId ${userId}`})

        if (findCartOfUser) {

            /** =================Updating price when products get added ============================*/
            let price = findCartOfUser.totalPrice + (req.body.quantity * findProduct.price)
            let itemsArray = findCartOfUser.items

            //updating quantity.

            for ( let i=0;i<itemsArray.length ; i++) {
                if (itemsArray[i].productId == productId) {
                    
                    itemsArray[i].quantity += quantity

                    let updatedCart = {
                        items: itemsArray,
                        totalPrice: price,
                        totalItems: itemsArray.length
                    }
                    let Data = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })
                    return res.status(200).send({ status: true, message: `Product added successfully to Cart`, data: Data })
                }
            }
            /*==========storing the updated prices and quantity to the newly created array======*/
            itemsArray.push({ productId: productId, quantity: quantity })

            let updatedCart = {
                items: itemsArray,
                totalPrice: price,
                totalItems: itemsArray.length
            }
            let Data = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

            return res.status(200).send({ status: true, message: 'Product added successfully to Cart', data: Data })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }

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
       await checkCartExist.save()
    }
    return res.status(200).send({ status: true, message: "Data updated successfuly", data: checkCartExist })
}

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        
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
