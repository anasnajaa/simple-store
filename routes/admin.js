const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin, isLoggedOut} = require('../middleware/hasAuth');
const brand = require('../controllers/brand.controller');

router.get('/brands', isAdmin, brand.show_brands);
router.post('/brands', isAdmin, brand.submit_brand);

router.get('/brand/:id', isAdmin, brand.show_brand);

router.get('/brand/:id/edit', isAdmin, brand.show_edit_brand);
router.post('/brand/:id/edit', isAdmin, brand.edit_brand);

router.post('/brand/:id/delete', isAdmin, brand.delete_brand);

module.exports = router;
