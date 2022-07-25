const mongoose = require('mongoose');
const userModel = require("../model/userModel");
const validator = require("validator")





// -------------------------------------------Get User Details---------------------------------------------------//

const getUserDetails = async function (req, res) {
    try {
        const user = req.params.userId;
        if (validator.isValidObjectId(user)) {
            res.status(400).send({ status: false, message: "Invalid UserId" })
        }
        if (!user) {
            res.status(400).send({ status: false, message: "pz give userId in params" })
        }

        const findUser = await userModel.find({ _id: user }).select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1 });

        if (findUser) {
            res.status(200).send({ status: true, message: "User profile details", data: findUser })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


module.exports = { getUserDetails };