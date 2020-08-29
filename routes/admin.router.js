const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/hasAuth');
const {brandRoutes} = require('./brand.router');
const admin = require('../controllers/admin.controller');

router.get("", isAdmin, admin.show_home);

brandRoutes(router);

module.exports = router;