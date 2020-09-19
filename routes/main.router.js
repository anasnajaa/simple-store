const express = require('express');
const router = express.Router();
const index = require('../controllers/index.controller');
const user = require('../controllers/user.controller');
const {isLoggedIn, isAdmin, isLoggedOut} = require('../middleware/hasAuth');

router.get('/', index.get_landing);

router.get('/login', isLoggedOut, user.show_login);
router.post('/login', isLoggedOut, user.admin_login);

router.get('/signup', isLoggedOut, user.show_signup);
router.post('/signup', isLoggedOut, user.admin_signup);

router.get('/logout', user.admin_logout);
router.post('/logout', user.admin_logout);

module.exports = router;