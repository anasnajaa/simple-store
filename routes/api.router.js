const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isLoggedOut} = require('../middleware/hasAuth');
const brand = require('../controllers/brand.controller');

router.delete('/brand/:id', isAdmin, brand.api_delete_brand);

module.exports = router;