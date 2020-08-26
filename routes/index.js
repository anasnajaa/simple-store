const express = require('express');
const router = express.Router();
const landing = require('../controllers/landing.controller');
const user = require('../controllers/user.controller');
const {isLoggedIn, isAdmin} = require('../middleware/hasAuth');

router.get('/', landing.get_landing);

router.get('/leads', isAdmin, landing.show_leads);
router.post('/leads', isAdmin, landing.submit_lead);

router.get('/lead/:id', isAdmin, landing.show_lead);

router.get('/lead/:id/edit', isAdmin, landing.show_edit_lead);
router.post('/lead/:id/edit', isAdmin, landing.edit_lead);

router.post('/lead/:id/delete', isAdmin, landing.delete_lead);

router.delete('/api/lead/:id', isAdmin, landing.api_delete_lead);

router.get('/login', user.show_login);
router.post('/login', user.login);

router.get('/signup', user.show_signup);
router.post('/signup', user.signup);

router.get('/logout', user.logout);
router.post('/logout', user.logout);

module.exports = router;