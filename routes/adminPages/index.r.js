const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middleware/hasAuth');
const {brandRoutes} = require('./brands.r');
const {areaRoutes} = require('./areas.r');
const admin = require('../../controllers/admin.c');

router.get("", isAdmin, admin.show_home);

brandRoutes(router);
areaRoutes(router);

module.exports = router;