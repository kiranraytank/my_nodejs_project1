const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Login Routes
router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);

// Dashboard Routes
router.get('/', isAuthenticated, adminController.dashboard);
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.redirect('/admin');
});

// Admin List Routes
router.get('/list', isAuthenticated, adminController.adminList);

// Add Admin Routes
router.get('/add', isAuthenticated, adminController.showAddForm);
router.post('/add', isAuthenticated, adminController.addAdmin);

// Get Admin Routes
router.get('/get/:id', isAuthenticated, adminController.getAdmin);

// Update Admin Routes
router.post('/update', isAuthenticated, adminController.updateAdmin);

// Delete Admin Route - Handle both DELETE and POST methods
router.delete('/delete/:id', isAuthenticated, adminController.deleteAdmin);
router.post('/delete/:id', isAuthenticated, adminController.deleteAdmin);


// Logout Route
router.get('/logout', adminController.logout);

module.exports = router; 