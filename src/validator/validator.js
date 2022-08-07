
const mongoose = require("mongoose");

//  valdiation for type of value 
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
};
const isValidInput = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length > 0) return true
    return false;
};


const isValidAddress = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "object" && Array.isArray(value)===false && Object.keys(value).length>0) return true
    return false
}

const isValidObjectId = function (value) {
    return mongoose.Types.ObjectId.isValid(value);
  };
  

// VALIDATION for the request body is empty


const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
const isEmptyObject = function(body){
    if(!body)
    return true ;
    if(Object.keys(body).length==0) return true;
    return false
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


// valid price-
const isValidPrice = function (value) {
if(!(/^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/.test(value))){

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

const isValidPincode = function (value) {
    if (!(/^\d{6}$/.test(value))) {
        return false
    }
    return true
};
const isValidPassword = (value) =>{
    if (typeof value === "undefined" || value === null) return false
    const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/
    return re.test(value)
}
 const isValidImageType = function (value) {
    const regexForMimeTypes = /image\/png|image\/jpeg|image\/jpg/;
    return regexForMimeTypes.test(value)
 }
 const isValidJson = (json)=>{return JSON.parse(json)}


module.exports = { isValid,isValidAddress, isValidObjectId,isValidBody, isValidEmail, isValidNumber, isValidName, isValidPincode,isValidInput,isValidPrice ,isValidPassword,isValidImageType,isValidJson,isEmptyObject};
