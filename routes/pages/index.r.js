const express = require('express');
const router = express.Router();
const index = require('../../controllers/index.c');
const user = require('../../controllers/user.c');
const account = require('../../controllers/account.c');
const {isLoggedIn, isAdmin, isLoggedOut} = require('../../middleware/hasAuth');

router.get('/', index.page_landing);

router.get('/login', isLoggedOut, user.page_login);
router.post('/login', isLoggedOut, user.page_login);

router.get('/signup', isLoggedOut, user.page_signup);
router.post('/signup', isLoggedOut, user.page_signup);

router.get('/logout', user.admin_logout);
router.post('/logout', user.admin_logout);

router.get("/account", isLoggedIn, account.page_dashboard);
router.get("/account/profile", isLoggedIn, account.page_profile);

module.exports = router;