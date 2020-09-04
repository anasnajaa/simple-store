const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/hasAuth');
const brand = require('../controllers/brand.controller');
const awsS3 = require('../util/awsS3');
const {v4} = require('uuid');
router.delete('/brand/:id', isAdmin, brand.api_delete_brand);

router.delete('/brand-category/:id', isAdmin, brand.api_delete_brand_category);

router.get('/sign-s3', isAdmin, async (req, res, next)=>{
    const fileName = v4() +"."+ req.query['file-name'].split(".")[1];
    const fileType = req.query['file-type'];
    const data = await awsS3.getSignedUrl(fileName, fileType);
    res.json(data);
});

module.exports = router;