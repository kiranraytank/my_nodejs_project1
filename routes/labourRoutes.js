const express = require('express');
const router = express.Router();
const LabourController = require('../controllers/labourController');
// const {  = require('../middleware/auth');

const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply admin middleware to all routes
router.use(isAuthenticated);


// Labour management page
router.get('/management', LabourController.getLabourManagementPage);

// Create new labour task
router.post('/tasks', LabourController.createTask);

// Create new labour assignment
router.post('/assignments', LabourController.createAssignment);

// Filter assignments
router.get('/assignments/filter', LabourController.filterAssignments);

// Generate salary slip
router.get('/salary-slip/:assignment_id', LabourController.generateSalarySlip);

module.exports = router; 