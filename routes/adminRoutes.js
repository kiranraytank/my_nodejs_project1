const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Login routes
router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);

// Registration routes
router.get('/register', adminController.registerPage);
router.post('/register', adminController.register);

// Protected routes
router.get('/dashboard', isAuthenticated, adminController.dashboard);
router.get('/logout', isAuthenticated, adminController.logout);

module.exports = router;