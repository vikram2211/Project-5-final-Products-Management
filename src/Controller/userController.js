const userModel = require("../model/userModel");
const validator = require("../validator/validator")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs");
const aws = require('../aws/aws');


//=============================================User Register===============================================/
const createUser = async function (req, res) {
    try {
       
        let requestBody = req.body
        // let data = JSON.parse(JSON.stringify(req.body));
        let { fname, lname, email, password, phone, address } = requestBody
        let files = req.files;
       
        
        //     if (!validator.isValidBody(data)) {
        //         return res.status(400).send({ status: false, msg: "User body should not be empty" });
        //     }

        //     if (!validator.isValid(fname)) {
        //         return res.status(400).send({ status: false, message: "fname should not be empty" })
        //     }

        //     if (!validator.isValid(lname)) {
        //         return res.status(400).send({ status: false, message: "lname should not be empty" })
        //     }

        //     if (!validator.isValidEmail(email)) {
        //         return res.status(400).send({ status: false, message: "Enter a valid E- mailID" })
        //     }

        //     if (!validator.isValidPassword(password)) {
        //         return res.status(400).send({ status: false, message: "password is not valid password should contain  8 -12,one lower case and upper case letter with special character" })
        //     }

        //     if (!validator.isValidNumber(phone)) {
        //         return res.status(400).send({ status: false, msg: "Invalid phone number  ( it has to start with +91-)" })
        //     }

        // //    try{
        //     // address = JSON.parse(address)
        //     if (Object.keys(address)==0) {
        //         return res.status(400).send({ status: false, message: "Address is required" })
        //     }

        //     if (!Object.keys(address.shipping)==3){ return res.status(400).send({ status: false, message: "Shipping address is required" })}

        //     if (!Object.keys(address.billing)==3){ return res.status(400).send({ status: false, message: "billing address is required" })}



        //     if (!validator.isValid(address.shipping.street)) return res.status(400).status({ status: false, message: "please enter street for shipping address" });

        //     if (!validator.isValid(address.shipping.city)) return res.status(400).status({ status: false, message:"please enter city for shipping address"  });

        //     if (!/^[1-9][0-9]{5}$/.test(address.shipping.pincode)) return res.status(400).status({ status: false, message:  "please enter pincode for shipping address"  });

        //     if (!validator.isValid(address.billing.street)) return res.status(400).status({ status: false, message:"please enter street for billing address"  });

        //     if (!validator.isValid(address.billing.city)) return res.status(400).status({ status: false, message:  "please enter city for billing address"  });

        //     if (!/^[1-9][0-9]{5}$/.test(address.billing.pincode)) return res.status(400).status({ status: false, message: "please enter pincode for billing address" });
        // // } 
        // // catch(error){ 
        // //     return res.status(400).send({ status: false, message: "catch address is not given" })
        // // }

        let CheckEmail = await userModel.findOne({ email });

        if (CheckEmail) {
            return res.status(400).send({ status: false, message: ` ${email} mail is already registered` })
        }
        let CheckNumber = await userModel.findOne({ phone });

        if (CheckNumber) {
            return res.status(400).send({ status: false, message: `${phone} phone is already used` })
        }
        address = JSON.parse(address)
        const { shipping, billing } = address;
        if(Object.keys(shipping).length<3) return res.status(400)
        if (!validator.isValidAddress(shipping)) {
            return res.status(400)
        } else {
            const { street, city, pincode } = shipping
            
             if (!validator.isValidInput(street)) return res.status(400).status({ status: false, message: "please enter street for shipping address" });
             if (!validator.isValidInput(city)) return res.status(400).status({ status: false, message: "please enter street for shipping address" });
             if (!/^[1-9][0-9]{5}$/.test(pincode)) return res.status(400).status({ status: false, message:  "please enter pincode for shipping address"  });
             
        }
        if (!validator.isValidAddress(billing)) {
            return res.status(400)
        } else {
            const { street, city, pincode } = billing
            
             if (!validator.isValidInput(street)) {

                 return res.status(400).status({ status: false, message: "please enter street for shipping address" });}
             if (!validator.isValidInput(city)) return res.status(400).status({ status: false, message: "please enter street for shipping address" });
             if (!/^[1-9][0-9]{5}$/.test(pincode)) return res.status(400).status({ status: false, message:  "please enter pincode for shipping address"  });
             
        }

      
        if (!files || files.length === 0) {
            return res.status(400).send({ status: false, message: "userImage is Required" })
        }
        if(!validator.isValidImageType(files[0].mimetype)) {
            return
        }
      
        let profileImage = await aws.uploadFile(files[0]);

        let saltRounds = 8;
        const encryptPassword=await bcrypt.hash(password, saltRounds)
        const user = {
            fname:fname.trim(),lname: lname.trim(), email:email.trim(), password:encryptPassword, phone:phone.trim(), address:address,profileImage: profileImage
        }
        // .then(function (hash) {
        //     requestBody.password = hash;
        // });
        //generate salt to hash password
        //const salt = await bcrypt.genSalt(10);
        // now we set password to hashed password
        //password = await bcrypt.hash(password, salt)
        //let encryptPassword = await bcrypt.hash(password, 12)


        let savedData = await userModel.create(user)

        return res.status(201).send({ status: true, message: "User created successfully", data: savedData })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};

//================================loginuser===================================//

const login = async function (req, res) {
    try {
        let data = req.body
        const { email, password } = data

        /*----------------------------validations ----------------------------*/
        if (!validator.isValidBody(data)) { return res.status(400).send({ status: false, msg: "Please provide user details" }) }

        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: "Email is Required" }); }

        if (!validator.isValidPassword(password)) { return res.status(400).send({ status: false, message: "Password is Required" }); }

        let checkEmail = await userModel.findOne({ email: email });
        if (!checkEmail) {
            return res.status(400).send({ status: false, message: "This email is not valid" });
        }
        let compare = await bcrypt.compare(password, checkEmail.password).then((res) => {
            return res
        });

        if (!compare) { return res.status(400).send({ status: false, msg: "password not valid" }); }


        //create the jwt token 
        let token = jwt.sign({
            userId: checkEmail._id.toString(),
            group: 8

        }, "project5Group8", { expiresIn: "1d" });

        // res.setHeaders("x-api-key", token);

        return res.status(200).send({ status: true, message: "User login successfull", iat: new String(Date()), data: { userId: checkEmail._id.toString(), token } })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
// -------------------------------------------Get User Details---------------------------------------------------//

const getUserDetails = async function (req, res) {
    try {
        const user = req.params.userId;
        if (!validator.isValidObjectId(user)) {
            res.status(400).send({ status: false, message: "Invalid UserId" })
        }
        if (!user) {
            res.status(400).send({ status: false, message: "please give userId in params" })
        }

        const findUser = await userModel.find({ _id: user }).select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1 })

        if (findUser) {
            return res.status(200).send({ status: true, message: "User profile details", data: findUser })
        } else {
            return res.status(404).send({ status: false, message: "no user found" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// --------------------------------------------------------Update-------------------------------------------------------------------------//

const update = async function (req, res) {
    try {

        let user = req.params.userId;
        let data = JSON.parse(JSON.stringify(req.body));
        // let data = req.body;
        if (!validator.isValidBody(data)) return res.status(400).status({ status: false, message: "please enter data to update" });
        let { fname, lname, email, password, phone, profileImage, address } = req.body;

        if (fname) {
            if (!validator.isValid(fname)) return res.status(400).status({ status: false, message: "please enter data to update" });
        }
        if (lname) {
            if (!validator.isValid(lname)) return res.status(400).status({ status: false, message: "please enter data to update" });
        }
        if (email) {
            if (!validator.isValidEmail(email)) return res.status(400).status({ status: false, message: "please enter data to update" });

            let checkEmail = await userModel.findOne({ email })
            if (checkEmail) {
                return res.status(400).send({ status: false, message: "email already exist." })
            }
        }
        if (password) {
            if (!validator.isValidPassword(password)) return res.status(400).status({ status: false, message: "please enter data to update" });
            let saltRounds = 8;
            await bcrypt.hash(password, saltRounds).then(function (hash) {
                password = hash;
            });
        }
        if (phone) {
            if (!validator.isValidNumber(phone)) return res.status(400).status({ status: false, message: "please enter data to update" });

            let checkPhone = await userModel.findOne({ phone })
            if (checkPhone) {
                return res.status(400).send({ status: false, message: "phone number already exist." })
            }
        }
        if (profileImage) {
            if (!validator.isValid(profileImage)) return res.status(400).status({ status: false, message: "please enter data to update" });
        }
        if (address)
            if (Object.keys(address) == 0) {
                if (address.shipping.street) {
                    if (!validator.isValid(address.shipping.street)) return res.status(400).status({ status: false, message: "please enter data to update" });
                }
                if (address.shipping.city) {
                    if (!validator.isValid(address.shipping.city)) return res.status(400).status({ status: false, message: "please enter data to update" });
                }
                if (address.shipping.pincode) {
                    if (!/^[1-9][0-9]{5}$/.test(address.shipping.pincode)) return res.status(400).status({ status: false, message: "please enter data to update" });
                }
                if (address.billing.street) {
                    if (!validator.isValid(address.billing.street)) return res.status(400).status({ status: false, message: "please enter data to update" });
                }
                if (address.billing.city) {
                    if (!validator.isValid(address.billing.city)) return res.status(400).status({ status: false, message: "please enter data to update" });
                }
                if (address.billing.pincode) {
                    if (!/^[1-9][0-9]{5}$/.test(address.billing.pincode)) return res.status(400).status({ status: false, message: "please enter data to update" });
                }

            }
        const updatedData = await userModel.findOneAndUpdate({ _id: user, isDeleted: false },
            { fname: fname, lname: lname, email: email, password: password, phone: phone, address: address }, { new: true });
        if (updatedData) return res.status(200).send({ status: true, message: "user data updated sucessfully", data: updatedData });
        else return res.status(400).send({ status: false, message: "data can't be updated" });
    } catch (err) {
        return res.status(500).send({ status: true, message: err.message })
    }
}

module.exports = {
    createUser,
    login,
    getUserDetails,
    update
};
