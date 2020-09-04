const AWS = require('aws-sdk');
const {
    v4
} = require('uuid');
require('dotenv').config();

const awsRegion = process.env.AWS_S3_REGION;
const awsBucket = process.env.AWS_S3_BUCKET;
const awsAccessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
const awsAccessSecretKey = process.env.AWS_S3_ACCESS_KEY_SECRET;

AWS.config.region = awsRegion;

const s3 = new AWS.S3({
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsAccessSecretKey
});

exports.fileUrl = (fileName)=>{
    return `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${fileName}`;
}

exports.deleteFiles = (files)=> {
    return new Promise((resolve)=>{
        try {
            const deleteParam = {
                Bucket: awsBucket,
                Delete: {Objects: []}
            };
        
            files.forEach(file=>{
                deleteParam.Delete.Objects.push({Key: file});
            })
        
            s3.deleteObjects(deleteParam, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                } 
                else {
                    resolve(data);
                }
            });
        } catch (error) {
            console.log(error);
            resolve(null);
        }
    });
}

exports.uploadFile = (fileObject, fileName) => {
    return new Promise((resolve) => {
        try {
            let fName = "";

            if (fileName === null) {
                fName = v4() + "." + fileObject.name.split(".")[1];
            } else {
                fName = fileName;
            }

            const fileContent = Buffer.from(fileObject.data, 'binary');

            const params = {
                Bucket: awsBucket,
                Key: fName,
                Body: fileContent
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                data.fileName = fName;
                return resolve(data);
            });
        } catch (error) {
            console.log(error);
            resolve(null);
        }
    });
};

exports.getSignedUrl = (fileName, fileType) => {
    return new Promise((resolve, reject) => {
        const s3Params = {
            Bucket: awsBucket,
            Key: fileName,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
        };

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve({
                fileName,
                fileType,
                signedRequest: data,
                url: this.fileUrl(fileName)
            });
        });
    });
};