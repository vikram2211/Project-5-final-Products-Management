const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        trim: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            trim: true,
            min: 1
        },
        _id: false
    }],
    totalPrice: {
        type: Number,
        required: true,
        trim: true
    },                           // comment: "Holds total price of all the items in the cart"
    totalItems: {
        type: Number,
        required: true,
        trim: true
    },                          // comment: "Holds total number of items in the cart"
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


module.exports = mongoose.model("cart", cartSchema);