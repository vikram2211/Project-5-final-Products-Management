const jwt = require("jsonwebtoken");
const validator = require("../validator/validator");
const userModel = require("../model/userModel");

const authentication = async function (req, res, next) {
    try {

        let token;
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(400).send({ status: false, message: "token is missing." })
        }
        jwt.verify(token, "project5Group8", function (err, decoded) {
            if (err) {
                return res.status(401).send({ status: false, message: "token invalid" })
            } else {
                if (Date.now() > decoded.exp * 1000) {
                    return res.status(401).send({ status: false, message: "token is expired" })
                }
                req.token = token
                next();
            }
        })

    } catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const Authorization = async function (req, res, next) {
    try {
        // let token;
        // if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        //     token = req.headers.authorization.split(' ')[1]
        // }
        // if (!token) { return res.status(400).send({ status: false, msg: "Enter x-api-key In Header" }); }
        let token = req.token
        let userId = req.params.userId
        let decodedToken = jwt.decode(token, "project5Group8")
        // check the user id present in body
        if (!validator.isValid(userId)) return res.status(400).send({ status: false, message: "userId is Required" });

        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is not valid" });
        //check the  user id are present in decoded token
        let User = await userModel.findById(userId)
        if (!User) return res.status(404).send({ status: false, msg: "User not exist" })

        if (userId != decodedToken.userId) { return res.status(401).send({ status: false, msg: "Not Authorised!!" }) }

        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports = { authentication,Authorization}