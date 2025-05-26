const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply admin middleware to all routes
router.use(isAuthenticated);

// Role Routes
router.get('/list', roleController.listRoles);
router.get('/add', roleController.showAddRole);
router.post('/add', roleController.addRole);
router.get('/edit/:id', roleController.showEditRole);
router.post('/edit/:id', roleController.editRole);
router.post('/delete/:id', roleController.deleteRole);

module.exports = router;
