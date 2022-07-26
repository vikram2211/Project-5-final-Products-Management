const userModel = require("../model/userModel");
const validator = require("../validator/validator")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const AWS = require('../aws/aws')


//=============================================User Register===============================================/
const createUser = async function (req, res) {
    try {
        let data = req.body
        let { fname, lname, email, password, phone, address } = data

        if (!validator.isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "User body should not be empty" });
        }

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname should not be empty" })
        }
        if (!validator.isValidName(fname)) {
            return res.status(400).send({ status: false, msg: "Invalid fname" })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname should not be emptyt" })
        }
        if (!validator.isValidName(lname)) {
            return res.status(400).send({ status: false, msg: "Invalid lname" })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email should not be emptyt" })
        }
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Enter a valid E- mailID" })
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password must be present" })
        }
        if (!validator.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "password is not valid password should contain  8 -12,one lower case and upper case letter with special character" })
        }
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone must be present" })
        }
        if (!validator.isValidNumber(phone)) {
            return res.status(400).send({ status: false, msg: "Invalid phone number  ( it has to start with +91-)" })
        }
        if (!address) {
            return res.status(400).send({ status: false, message: "Address is required" })
        }
        let CheckEmail = await userModel.findOne({ email });

        if (CheckEmail) {
            return res.status(400).send({ status: false, message: ` ${email} mail is already registered` })
        }
        let CheckNumber = await userModel.findOne({ phone });

        if (CheckNumber) {
            return res.status(400).send({ status: false, message: `${phone} phone is already used` })
        }



         //generate salt to hash password
        //const salt = await bcrypt.genSalt(10);
        // now we set password to hashed password
        //password = await bcrypt.hash(password, salt)
        //let encryptPassword = await bcrypt.hash(password, 12)

  



        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await AWS.uploadFile(files[0]);
            data.profileImage = uploadedFileURL
        }
        else {
            return res.status(400).send({ status: false, message: "ProfileImage is Required" })
        }
        let savedData = await userModel.create(userData)

        return res.status(201).send({ status: true, message: "User created successfully", data: savedData })


    } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
}
};








//================================loginuser===================================//




const Login = async function (req, res) {
    try {
        let data = req.body
        const { email, password } = data

        /*----------------------------validations ----------------------------*/
        if (!validator.isValidReqBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user details" }) }

        if (!validator.isValid(email)) { return res.status(400).send({ status: false, message: "Email is Required" }); }

        if (!validator.isValid(password)) { return res.status(400).send({ status: false, message: "Password is Required" }); }

        let hash = await userModel.findOne({ email: email });
        if (!hash) {
            return res.status(400).send({ status: false, message: "This email id not valid" });
        }
        let compare = await bcrypt.compare(password, hash.password).then((res) => {
            return res
        });

        if (!compare) { return res.status(400).send({ status: false, msg: "password not valid" }); }


        //create the jwt token 
        let token = jwt.sign({
            userId: hash._id.toString(),
            group: 8

        }, "project5Group8", { expiresIn: "1d" });

        res.setAuthorization  ("x-api-key", token);

        return res.status(200).send({ status: true, message: "User login successfull", iat: new String(Date()), data: { userId: hash._id.toString(), token } })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
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


module.exports = {
    createUser,
    getUserDetails, Login
};
