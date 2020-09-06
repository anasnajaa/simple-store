const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/hasAuth');
const {brandRoutes} = require('./brand.router');
const {areaRoutes} = require('./area.router');
const admin = require('../controllers/admin.controller');

router.get("", isAdmin, admin.show_home);

brandRoutes(router);
areaRoutes(router);

module.exports = router;