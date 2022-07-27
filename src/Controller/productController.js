const productModel = require("../model/productModel");
const validator = require("../validator/validator");
const AWS = require('../aws/aws')


const createProduct = async function (req, res) {

}


const getProductDetails = async function (req, res) {

}

const getProductsById = async function (req, res) {

}

const updateProductById = async function (req, res) {
    try {
        const user = req.params.productId;
        let data = req.body;


        if (!productId) {
            return res.status(400) .send({ status: false, message: "ProductId NOT given in Params." });
        }

        if (validator.isValidObjectId(user)) {
            res.status(400).send({ status: false, message: "Invalid ProductId" })
        }

        // const productFound = await productModel.findOne({
        //     _id: productId,
        //     isDeleted: false,
        //   });

        //   if (!productFound) {
        //     return res
        //       .status(404)
        //       .send({ status: false, message: "Product NOT Found." });
        //   }

        let { title, description, price, currencyId, currencyFormat, style, installments } = data

        if(!validator.isValidBody(data)){res.status(400).send({ststus:false,message:"please entre data to update"})};

        // title-

        // if(!title){res.status(400).send({status:false,message:"please entre title."})}

        if(!validator.isValid(title)){res.status(400).send({status:false,message:"please entre a valid title."})}

        // description-

        // if(!description){res.status(400).send({status:false,message:"please entre description."})}

        if(!validator.isValid(description)){res.status(400).send({status:false,message:"please entre a valid description."})}

        // price-

        // if(!price){res.status(400).send({status:false,message:"please entre price."})}

        if(!validator.isValidPrice(price)){res.status(400).send({status:false,message:"please entre valid price."})}

        // currencyId-

        // if(!currencyId){res.status(400).send({status:false,message:"please entre currencyId."})}

        if(!validator.isValid(currencyId)){res.status(400).send({status:false,message:"please entre a valid currencyId."})}

        // currencyFormat-

        // if(!currencyFormat){res.status(400).send({status:false,message:"please entre currencyFormat."})}

        if(!validator.isValid(currencyFormat)){res.status(400).send({status:false,message:"please entre a valid currencyFormat."})}

        // style-

        if(!validator.isValid(style)){res.status(400).send({status:false,message:"please entre a valid style."})}

        // installments-

        if (installments)
        if (!/^[0-9 ]+$/.test(installments)) return res.status(400).send({ status: false, message: "installments must be in numeric" })

        // uploading-

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await AWS.uploadFile(files[0]);
            data.profileImage = uploadedFileURL
        }
       
        const updatedProduct = await productModel.findOneAndUpdate({ _id: req.params.productId, isDeleted: false },
            {title:title, description:description,price:price,currencyId:currencyId,currencyFormat:currencyFormat,style:style,installments:installments}, { new: true });
        if (updatedProduct) return res.status(200).send({ status: true, message: "product data updated sucessfully", data: updatedProduct });
        else return res.status(400).send({ status: false, message: "data can't be updated" });
        
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

const deleteProductById = async function (req, res) {

}

module.expoerts = { createProduct, getProductDetails, getProductsById, updateProductById, deleteProductById };