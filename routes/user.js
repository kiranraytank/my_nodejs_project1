const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const { isAdmin } = require('../middleware/auth');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply admin middleware to all routes
router.use(isAuthenticated);

// User routes
router.get('/list', userController.userList);
router.post('/add', userController.addUser);
router.post('/update', userController.updateUser);
// router.delete('/delete/:id', userController.deleteUser);
router.post('/delete/:id', userController.deleteUser);


// Get User Routes
router.get('/get/:id', userController.getUser);


module.exports = router; 