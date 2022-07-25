const userModel = require("../model/userModel");
const validator = require("../validator/validator")



//=============================================User Register===============================================/
const CreateUser = async function (req, res) {
    try {
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "User body should not be empty" });
        }
        let { fname, lname, email, password, phone, address } = body

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
        let CheckEmail = await userModel.findOne({ email });
        if (CheckEmail) {
            return res.status(400).send({ status: false, message: ` ${email} mail is already registered` })
        }
        let CheckNumber = await userModel.findOne({ phone });
        if (CheckNumber) {
            return res.status(400).send({ status: false, message: `${phone} phone is already used` })
        }


        
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};