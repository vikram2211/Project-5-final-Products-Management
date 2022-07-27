
const mongoose = require("mongoose");

//  valdiation for type of value 
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
};


// VALIDATION for the request body is empty


const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
//********* Object.keys returns the array of an object && if empty null **************/
// validation for mobile number

const isValidEmail = function (value) {

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return false
    }
    return true
};
//checks validation for indian mobile number
const isValidNumber = function (value) {

    if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(value))) {

        return false
    }
    return true
};
//valid type of name in request body
const isValidName = function (value) {
    if (!(/^[A-Za-z ]+$/.test(value.trim()))) {
        return false
    }
    return true
};
// //(?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
// (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
// (?=.*[0-9])	The string must contain at least 1 numeric character
// (?=.*[!@#$%^&*])	The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
// (?=.{8,})	The string must be eight characters or longer
//^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})
// const isValidPassword = function (value) {
//     if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,15})$/.test(value))) {
//         return false
//     }
//     return true
// };
//validiation for  the pincode
const isValidPincode = function (value) {
    if (!(/^\d{6}$/.test(value))) {
        return false
    }
    return true
};


module.exports = { isValid, isValidBody, isValidEmail, isValidNumber, isValidName, isValidPincode };
// isValidPassword,