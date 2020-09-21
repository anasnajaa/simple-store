const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middleware/hasAuth');
const awsS3 = require('../../util/awsS3');
const {v4} = require('uuid');

const brandApiRouter = require('./brands.r');
const categoriesApiRouter = require('./categories.r');
const accountApiRouter = require('./account.r');

brandApiRouter.init(router);
categoriesApiRouter.init(router);
accountApiRouter.init(router);

router.get('/sign-s3', isAdmin, async (req, res, next)=>{
    const fileName = v4() +"."+ req.query['file-name'].split(".")[1];
    const fileType = req.query['file-type'];
    const data = await awsS3.getSignedUrl(fileName, fileType);
    res.json(data);
});

module.exports = router;