const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(

{ 

title: {type:String,  required:true,trim:true},

  description: {type:String,  required:true,trim:true},

  price: {type:Number, required:true},//valid decimel no
  
  currencyId: {type:String,  required:true},//INR

  currencyFormat: {type:String,  required:true},//Rupee symbol

  isFreeShipping: {type:Boolean, default: false},
  
  productImage: {type:String,  required:true},  // s3 link

  style: {type:String},

  availableSizes: {type:[String], enum:["S", "XS","M","X", "L","XXL", "XL"], required:true},//at least one 

  installments: {type:Number},

  deletedAt: {type:Date}, //when the document is deleted,

  isDeleted: {type:Boolean, default: false},

} ,{timestamps:true})


module.exports = mongoose.model("Product",productSchema);