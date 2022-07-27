const productModel = require("../model/productModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const aws = require('../aws/aws');


const createProduct = async function (req, res) {
  try {
     let data = JSON.parse(JSON.stringify(req.body));

    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;
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
        if (typeof (style) != "string" || style.trim().length == 0) {
            return res.status(400).send({ status: false, message: " please give value in string " })
        }
    }
   
    if (validator.isValid(availableSizes)) {
        availableSizes = availableSizes.trim().split(",").map(availableSizes => availableSizes.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!(availableSizes[i] == "S" || availableSizes[i] == 'XS' || availableSizes[i] == 'M' ||
                availableSizes[i] == 'L' || availableSizes[i] == 'X' || availableSizes[i] == 'XL' || availableSizes[i] == 'XXL')) {
                return res.status(400).send({ status: false, message: `please choose size from S, XS,M,X, L,XXL, XL ` })
            }
        }
    }else return res.status(400).send({ status: false, message: " please give availableSizes ( S, XS,M,X, L,XXL, XL ) " })
 data.availableSizes = availableSizes;

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
}catch(err) {
    return res.status(500).send({ status:false, message: err.message})
}
}


const getProductDetails = async function (req, res) {

}

const getProductsById = async function (req, res) {

}

const updateProductById = async function (req, res) {

}

const deleteProductById = async function (req, res) {

}

module.exports = { createProduct, getProductDetails, getProductsById, updateProductById, deleteProductById };