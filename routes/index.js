const express = require('express');
const router = express.Router();
const landing = require('../controllers/landing');

router.get('/', landing.get_landing);

router.get('/leads', landing.show_leads);
router.post('/leads', landing.submit_lead);

router.get('/lead/:id', landing.show_lead);

router.get('/lead/:id/edit', landing.show_edit_lead);
router.post('/lead/:id/edit', landing.edit_lead);

router.post('/lead/:id/delete', landing.delete_lead);

router.delete('/api/lead/:id', landing.api_delete_lead);

module.exports = router;