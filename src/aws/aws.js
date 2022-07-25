const aws = require('aws-sdk')

/********************************************AWS S3********************************************************/


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

// This block of code helps us to upload to awsfile and gives us back  the url for the file
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "group-08/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            //       console.log(data)
            //      console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}


//   router.post("/aws-s3", async function(req, res){

//     try{
//         let files= req.files
//         if(files && files.length>0){          
//             let uploadedFileURL= await uploadFile( files[0] )
//             res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
//         }
//         else{
//             res.status(400).send({ msg: "No file found" })
//         }  
//     }
//     catch(err){
//         res.status(500).send({msg: err})
//     }

//   })


// let files = req.files;
// if (files && files.length > 0) {
//     let uploadedFileURL = await aws.uploadFile(files[0]);
//     if (!validUrl.isUri(uploadedFileURL)) {
//         return res.status(400).send({ status: false, msg: 'invalid uploadFileUrl' })
//     }
module.exports = { uploadFile }