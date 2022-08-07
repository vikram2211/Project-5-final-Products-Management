const productModel = require("../model/productModel");
const validator = require("../validator/validator");
const mongoose = require('mongoose');
const aws = require('../aws/aws');


const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (!validator.isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "body should not be empty" });
        }
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;
         if(price) price = JSON.parse(price);
         if(installments) installments = JSON.parse(installments)
        if(isFreeShipping) isFreeShipping = JSON.parse(isFreeShipping)
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: " please give valid title " })
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
        if(currencyFormat)
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
        } else return res.status(400).send({ status: false, message: " please give availableSizes in Upper-case ( S, XS,M,X, L,XXL, XL ) " })
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
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


/*----------getProductById---------------------*/

const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please give a valid productId" })


        const product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) return res.status(404).send({ status: false, message: "product is not found." })
        return res.status(200).send({ status: true, message: "success", data: product })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}
/*-----------getProduct-Api-------------*/
const getProduct = async function (req, res) {
    try {
        const data = req.query;
        const keys = Object.keys(data);

        if (keys.length > 0) {
            const requiredParams = ['size', 'name', 'priceGreaterThan', 'priceLessThan'];

            for (let i = 0; i < keys.length; i++) {
                if (!requiredParams.includes(keys[i])) {  // returns true or false value in return   -- checks that partucular element is present in array or not
                    return res.status(400).send({ status: false, message: `Only these Query Params are allowed [${requiredParams}]` });
                }
            }

            let filter = {};
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] == 'size') {
                    filter.availableSizes = data.size;
                }
                else if (keys[i] == 'name') {
                    filter.title = {
                        $regex: new RegExp(`${data.name}`)
                        //Provides regular expression capabilities for pattern matching strings in queries.
                    };
                }
                else if (keys[i] == 'priceGreaterThan') {
                    filter.price = {
                        $gt: data.priceGreaterThan
                    }
                }
                else if (keys[i] == 'priceLessThan') {
                    filter.price = {
                        $lt: data.priceLessThan
                    }
                }
            }
            if (data['priceGreaterThan'] && data['priceLessThan']) {
                filter.price = {
                    $gt: data.priceGreaterThan,
                    $lt: data.priceLessThan
                }
            }
            filter.isDeleted = false;


            const filterData = await productModel.find(filter).sort({ price: 1 });
            if (filterData.length == 0) {
                return res.status(404).send({ status: false, message: 'No products avaliable' });
            }

            return res.status(200).send({ status: true, count: filterData.length, data: filterData });
            //The count() function is used to count the number of collections in the element.
        }
        else {
            const Getallproducts = await productModel.find({ isDeleted: false, deletedAt: null }).sort({ price: 1 });
            if (Getallproducts.length == 0) {
                return res.status(404).send({ status: false, message: "No products avaliable" });
            }
            return res.status(200).send({ status: true, count: Getallproducts.length, data: Getallproducts });
        }
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};

/*-------------delete-api--------------*/

const deleteProduct = async function (req, res) {
    let productId = req.params.productId;


    if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "please give a valid productId" })

    let productToBeDeleted = await productModel.findById(productId)
    if (!productToBeDeleted) return res.status(404).send({ status: false, msg: "Data not found" })
    if (productToBeDeleted.isDeleted == false) {

        let deletedProduct = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { isDeleted: true, deletedAt: new String(Date()) }, { new: true }
        );

        return res.status(200).send({ status: true, message: "product deleted successfully"});
    } else {
        return res.status(404).send({ status: false, message: "product not found." });
    }
};

/*-----------Update/put Api---------------------*/


const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId;
        let data = req.body;

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please give a valid productId" })
        }


        let productFound = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productFound) return res.status(404).send({ status: false, msg: "Product not found" })

        let { title, description, price, currencyId, currencyFormat, style, installments } = data

        if (!validator.isValidBody(data)) { return res.status(400).send({ status: false, msg: "Please enter data for update" }) }
        if (title)
            if (!validator.isValid(title)) return res.status(400).send({ status: false, message: "title  must be in alphabets" })
        let isTitlePresent = await productModel.findOne({ title })
        if (isTitlePresent) return res.status(400).send({ status: false, message: "title is already present" })

        if (description)

            if (!validator.isValid(description)) return res.status(400).send({ status: false, message: "description  must be in alphabets" })

        if (price)
            if (!/^[0-9 .]+$/.test(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })

        if (currencyId)
            if ((["INR"].indexOf(currencyId) == -1)) return res.status(400).send({ status: false, message: "currency Id must be INR" })

        if (currencyFormat)
            if ((["₹"].indexOf(currencyFormat) == -1)) return res.status(400).send({ status: false, message: "currency formet must be ₹ " })

        if (style)
            if (!validator.isValid(style)) return res.status(400).send({ status: false, message: "style must be in alphabets" })

        if (data.availableSizes) {
            let sizes = data.availableSizes.split(/[\s,]+/)
            let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]

            for (let i = 0; i < sizes.length; i++) {
                if (arr.indexOf(sizes[i]) == -1)
                    return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
            }
            data["availableSizes"] = sizes
        }

        if (installments)
            if (!/^[0-9 ]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })

        let files = req.files;
        if (files && files.length > 0) {
            let fileUrl = await aws.uploadFile(files[0]);
            data.productImage = fileUrl;
        }

        let updatedData = await productModel.findOneAndUpdate({ _id: productId,isDeleted:false }, data, { new: true });
        return res.status(200).send({ status: true, message: "product details updated", data: updatedData});
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};
module.exports = { createProduct, getProduct, getProductById, deleteProduct, updateProduct }



