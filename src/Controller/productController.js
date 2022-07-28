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
        } else return res.status(400).send({ status: false, message: " please give availableSizes ( S, XS,M,X, L,XXL, XL ) " })
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
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })


        const productData = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productData) return res.status(404).send({ status: false, message: "product is not found or product is deleted" })
        return res.status(200).send({ status: true, message: "success", data: productData })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}
/*-----------getProduct-Api-------------*/
const getProduct = async function (req, res) {
    try {
        let filter = req.query;
        let query = { isDeleted: false };
        if (filter) {
            const { name, description, isFreeShipping, style, size, installments } =
                filter;

            if (name) {
                if (!validator.isValid(name)) return res.status(400).send({ status: false, message: "name  must be alphabetic characters" })
                query.title = name;
            }
            if (description) {
                if (!validator.isValid(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })
                query.description = description.trim();

            }
            if (isFreeShipping) {
                if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {
                    return res.status(400).send({ status: false, massage: 'isFreeShipping should be a boolean value' })
                }
                query.isFreeShipping = isFreeShipping;
            }
            if (style) {
                if (!validator.isValid(style)) return res.status(400).send({ status: false, message: "style  must be alphabetic characters" })
                query.style = style.trim();
            }
            if (installments) {
                if (!/^[0-9]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })

                query.installments = installments;
            }
            if (size) {
                let sizes = size.split(/[\s,]+/)
                let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                console.log(sizes)
                for (let i = 0; i < sizes.length; i++) {
                    if (arr.indexOf(sizes[i]) == -1)
                        return res.status(400).send({ status: false, message: "availabe sizes must be (S, XS,M,X, L,XXL, XL)" })
                }
                const sizeArr = size
                    .trim()
                    .split(",")
                    .map((x) => x.trim());
                query.availableSizes = { $all: sizeArr };
            }
        }
        if (filter.priceLessThan) {
            if (!/^[0-9 .]+$/.test(filter.priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan must be in numeric" })
        }
        if (filter.priceGreaterThan) {
            if (!/^[0-9 .]+$/.test(filter.priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan must be in numeric" })
        }

        const query1 = await constructQuery(filter); // line-164
        let data = await productModel.find({ ...query, ...query1 }).collation({ locale: "en", strength: 2 }).sort({ price: filter.priceSort });

        if (data.length == 0) {
            return res.status(400).send({ status: false, message: "NO data found" });
        }

        return res.status(200).send({ status: true, message: "Success", count: data.length, data: data });
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};

const constructQuery = async (filter) => {
    if (filter.priceGreaterThan && filter.priceLessThan) {
        return {
            $and: [
                { price: { $gt: filter.priceGreaterThan, $lt: filter.priceLessThan } },
            ],
        };
    } else if (filter.priceGreaterThan) {
        return { price: { $gt: filter.priceGreaterThan } };
    } else if (filter.priceLessThan) {
        return { price: { $lt: filter.priceLessThan } };
    }
};

/*-------------delete-api--------------*/

const deleteProduct = async function (req, res) {
    let productId = req.params.productId;


    if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Invalid productId" })

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

/*-----------Update/put Api---------------------*/


const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId;
        let data = req.body;

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId" })
        }


        let alreadyDeleted = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!alreadyDeleted) return res.status(404).send({ status: false, msg: "Data not found" })

        let { title, description, price, currencyId, currencyFormat, style, installments } = data

        if (!validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please enter data for update" }) }
        if (title)
            if (!validator.isValid(title)) return res.status(400).send({ status: false, message: "title  must be alphabetic characters" })
        let isTitlePresent = await productModel.findOne({ title })
        if (isTitlePresent) return res.status(400).send({ status: false, message: "title is already present" })

        if (description)

            if (!validator.isValid(description)) return res.status(400).send({ status: false, message: "description  must be alphabetic characters" })

        if (price)
            if (!/^[0-9 .]+$/.test(price)) return res.status(400).send({ status: false, message: "price must be in numeric" })

        if (currencyId)
            if ((["INR"].indexOf(currencyId) == -1)) return res.status(400).send({ status: false, message: "currency Id must be INR" })

        if (currencyFormat)
            if ((["₹"].indexOf(currencyFormat) == -1)) return res.status(400).send({ status: false, message: "currency formet must be ₹ " })

        if (style)
            if (!validator.isValid(style)) return res.status(400).send({ status: false, message: "style must be alphabetic characters" })
        if (data.availableSizes) {
            let sizes = data.availableSizes.split(/[\s,]+/)
            let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            console.log(sizes)
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
            let fileUrl = await uploadFile(files[0]);
            data.productImage = fileUrl;
        }

        let updatedData = await productModel.findOneAndUpdate({ _id: productId }, data, { new: true });
        return res.status(200).send({ status: true, message: "product details updated", data: updatedData, });
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};
module.exports = { createProduct, getProduct, getProductById, deleteProduct, updateProduct }



