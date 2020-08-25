const express = require('express');
const router = express.Router();
const landing = require('../controllers/landing.controller');
const user = require('../controllers/user.controller');

router.get('/', landing.get_landing);

router.get('/leads', landing.show_leads);
router.post('/leads', landing.submit_lead);

router.get('/lead/:id', landing.show_lead);

router.get('/lead/:id/edit', landing.show_edit_lead);
router.post('/lead/:id/edit', landing.edit_lead);

router.post('/lead/:id/delete', landing.delete_lead);

router.delete('/api/lead/:id', landing.api_delete_lead);

router.get('/login', user.show_login);
router.post('/login', user.login);

router.get('/signup', user.show_signup);
router.post('/signup', user.signup);



module.exports = router;