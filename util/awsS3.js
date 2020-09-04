const AWS = require('aws-sdk');
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

exports.uploadFile = (fileContent, fileName) => {
    const params = {
        Bucket: fileContent,
        Key: fileName,
        Body: fileContent
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err);
            return null;
        }
        return data;
    });
};

exports.getSignedUrl = (fileName, fileType) => {
    return new Promise((resolve, reject)=>{
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
                url: `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${fileName}`
            });
        });
    });
};