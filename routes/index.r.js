const express = require('express');
const router = express.Router();

require('./brands.r').init(router);
require('./categories.r').init(router);
require('./account.r').init(router);
require('./aws.r').init(router);
require('./sms.r').init(router);

module.exports = router;