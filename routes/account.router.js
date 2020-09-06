const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/hasAuth');
const account = require('../controllers/account.controller');

router.get("", isLoggedIn, account.show_dashboard);
router.get("/profile", isLoggedIn, account.show_profile);
router.get("/address", isLoggedIn, account.show_address);
router.get("/orders", isLoggedIn, account.show_orders);
router.get("/wishlist", isLoggedIn, account.show_wishlist);

module.exports = router;