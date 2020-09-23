const awsS3 = require('../util/awsS3');
const {v4} = require('uuid');

exports.init = (router)=>{
    router.get('/sign-s3', async (req, res, next)=>{
        const fileName = v4() +"."+ req.query['file-name'].split(".")[1];
        const fileType = req.query['file-type'];
        const data = await awsS3.getSignedUrl(fileName, fileType);
        res.json(data);
    });
}