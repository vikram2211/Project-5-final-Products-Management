const productModel = require("../model/productModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const aws = require('../aws/aws');


const createProduct = async function (req, res) {
    let data = JSON.parse(JSON.stringify(req.body));

    let  { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;
  price = JSON.parse(price);
  installments = JSON.parse(installments)
  isFreeShipping = JSON.parse(isFreeShipping)
    if (!validator.isValid(title)) {
        return res.status(400).send({ status: false, message: " please give valid title ( in string)" })
    }
    if (typeof (price) != "number" || price < 0) {
        return res.status(400).send({ status: false, message: " please give valid number (must be greater than 0 )" })
    }
    if (!validator.isValid(description)) {
        return res.status(400).send({ status: false, message: " please give valid description ( in string)" })
    }
    if (!(currencyId == "INR" || currencyId == "USD")) {
        return res.status(400).send({ status: false, message: " please give valid currencyId e.g INR" })
    }
    if (!(currencyFormat == '₹' || currencyFormat == '$')) {
        return res.status(400).send({ status: false, message: " please give valid currencyFormat either '₹' or '$'" })
    }
    if (isFreeShipping) {
        if (typeof (isFreeShipping) != "boolean") {
            return res.status(400).send({ status: false, message: " please give isFreeShipping value in boolean " })
        }
    }
    if (style) {
        if (typeof (style) != "string"|| style.trim().length==0) {
            return res.status(400).send({ status: false, message: " please give value in string " })
        }
    }
    if(!(availableSizes=="S" || availableSizes=='XS' || availableSizes=='M' || availableSizes=='L' || availableSizes=='X' || availableSizes=='XL' || availableSizes=='XXL')) {
        return res.status(400).send({ status: false, message:'please choose size from "S", "XS","M","X", "L","XXL", "XL"' })
    }
    if (installments) {
        if (typeof (installments) != "number") {
            return res.status(400).send({ status: false, message: " please give value in number format " })
        }
    }
    let files = req.files;
    if (files && files.length > 0) {
        let uploadedFileURL = await aws.uploadFile(files[0]);
        data.productImage = uploadedFileURL;
    }
    else {
        return res.status(400).send({ status: false, message: "ProductImage is Required" })
    }
    const createdProduct = await productModel.create(data);
    return res.status(201).send({ status: true, message: "User created successfully", data: createdProduct });

}


const getProductDetails = async function (req, res) {
    try {

        let filterdata = req.query
        let { size, name, priceGreaterThan, priceLessThan } = filterdata
        let condition = { isDeleted: false };


        if (size) { condition.availableSize = size }
        
        if (name) { condition.title = name }

        if (priceGreaterThan) { condition.price = { $gt :priceGreaterThan }}

        if (priceLessThan) { condition.price ={ $lt : priceLessThan} }

        let getProducts = await productModel.find(condition).sort({ price: 1 });

        if (getProducts.length == 0) return res.status(404).send({ status: false, message: "no products found" })

        return res.status(200).send({ status: true, count: getProduct, data: getProducts })



        //     let getAllproduct = await productModel.find(query).sort({price:-1||1})
        //     if(!(getAllproduct.lenght>0)){
        //         return res.status(404).send({status:false,message:"No product found with the details"})
        //     }
        //     return res.status(200).send({status:true,message:"Success", data:getAllproduct})
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }







    
const getProductById = async function (req, res) {
    try {
      const productId = req.params.productId
  if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })
  
      
      const productData = await productModel.findOne({ _id: productId, isDeleted: false })
  
      if (!productData) return res.status(404).send({ status: false, message: "product is not found or product is deleted" })
      return res.status(200).send({ status: true, message: "success", data: productData })
    } catch (err) {
      res.status(500).send({ status: false, message: err.message })
  
    }

}

const updateProductById = async function (req, res) {

}


    const deleteProduct = async function (req, res) {
        let productId = req.params.productId;
      
      
        if (validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })
      
        let alreadyDeleted = await productModel.findById(productId)
        if (!alreadyDeleted) return res.status(404).send({ status: false, msg: "Data not found" })
        if (alreadyDeleted.isDeleted == false) {
      
          let deletePro = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { isDeleted: true, deletedAt: new String(Date()) }, { new: true }
          );
      
          return res.status(200).send({ status: true, message: "product deleted successfully", data: deletePro });
        } else {
          return res.status(400).send({ status: false, message: "product is already deleted" });
        }
      };
}

module.exports = { createProduct, getProductDetails, getProductById,  deleteProduct,updateProductById }

