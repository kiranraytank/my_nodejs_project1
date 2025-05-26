const LabourModel = require('./../models/labourModel');
const pool = require('../config/database');

class LabourController {
    // Render labour management page
    // controllers/labourController.js
    static async getLabourManagementPage(req, res) {
        try {
            const assignments = await LabourModel.getAssignments();
            const tasks = await LabourModel.getAllTasks();

            // ✅ Fetch all users (adjust table/column names as per your DB)
            const [users] = await pool.query('SELECT id, name AS username FROM users WHERE deleted_at IS NULL');

            res.render('labour/management', { 
                assignments, 
                tasks,
                users,           // ✅ Pass all users to the EJS view
                user: req.user   // Optional: currently logged-in user
            });
        } catch (error) {
            console.error('Labour Page Error:', error);
            res.status(500).render('error', { 
                message: 'Error loading labour management page',
                error
            });
        }
    }

    static async getLabourManagementPageOld(req, res) {
        try {
            const assignments = await LabourModel.getAssignments();
            const tasks = await LabourModel.getAllTasks();
            res.render('labour/management', { 
                assignments, 
                tasks,
                users: req.user
            });
        } catch (error) {
            console.error('Labour Page Error:', error);

            res.status(500).render('error', { 
                message: 'Error loading labour management page',
                error
            });
        }
    }

    // Create new labour task
    static async createTask(req, res) {
        try {
            const { task_name, description, daily_wage } = req.body;
            await LabourModel.createTask({ task_name, description, daily_wage });
            res.redirect('/labour/management');
        } catch (error) {
            res.status(500).render('error', { 
                message: 'Error creating labour task',
                error
            });
        }
    }

    // Create new labour assignment
    static async createAssignment(req, res) {
        try {
            const { user_id, task_id, start_date, end_date, days_worked } = req.body;
            await LabourModel.createAssignment({ 
                user_id, 
                task_id, 
                start_date, 
                end_date, 
                days_worked 
            });
            res.redirect('/labour/management');
        } catch (error) {
            res.status(500).render('error', { 
                message: 'Error creating labour assignment',
                error
            });
        }
    }

    // Filter assignments
    static async filterAssignments(req, res) {
        try {
            const filters = {
                user_id: req.query.user_id,
                task_id: req.query.task_id,
                start_date: req.query.start_date,
                end_date: req.query.end_date
            };
            const assignments = await LabourModel.getAssignments(filters);
            res.json(assignments);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error filtering assignments'
            });
        }
    }

    // Generate salary slip
    static async generateSalarySlip(req, res) {
        try {
            const { assignment_id } = req.params;
            const slip = await LabourModel.generateSalarySlip(assignment_id);
            res.render('labour/salary-slip', { 
                slip,
                user: req.user
            });
        } catch (error) {
            res.status(500).render('error', { 
                message: 'Error generating salary slip',
                error
            });
        }
    }
}

module.exports = LabourController; 