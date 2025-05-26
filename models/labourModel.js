const pool = require('../config/database');

class LabourModel {
    // Create a new labour task
    static async createTask(taskData) {
        const { task_name, description, daily_wage } = taskData;
        const query = 'INSERT INTO labour_tasks (task_name, description, daily_wage) VALUES (?, ?, ?)';
        return await pool.query(query, [task_name, description, daily_wage]);
    }

    // Get all labour tasks
    static async getAllTasks() {
        const query = 'SELECT * FROM labour_tasks ORDER BY created_at DESC';
        return await pool.query(query);
    }

    // Create a new labour assignment
    static async createAssignment(assignmentData) {
        const { user_id, task_id, start_date, end_date, days_worked } = assignmentData;
        const query = 'INSERT INTO labour_assignments (user_id, task_id, start_date, end_date, days_worked) VALUES (?, ?, ?, ?, ?)';
        return await pool.query(query, [user_id, task_id, start_date, end_date, days_worked]);
    }

    // Get all labour assignments with filters
    static async getAssignments(filters = {}) {
        let query = `
            SELECT la.*, lt.task_name, lt.daily_wage, u.name AS user_name
            FROM labour_assignments la
            JOIN labour_tasks lt ON la.task_id = lt.task_id
            JOIN users u ON la.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.user_id) {
            query += ' AND la.user_id = ?';
            params.push(filters.user_id);
        }
        if (filters.task_id) {
            query += ' AND la.task_id = ?';
            params.push(filters.task_id);
        }
        if (filters.start_date) {
            query += ' AND la.start_date >= ?';
            params.push(filters.start_date);
        }
        if (filters.end_date) {
            query += ' AND la.end_date <= ?';
            params.push(filters.end_date);
        }

        query += ' ORDER BY la.created_at DESC';
        return await pool.query(query, params);
    }

    // Generate salary slip
    static async generateSalarySlip(assignment_id) {
        const query = `
            SELECT la.*, lt.task_name, lt.daily_wage, u.name
            FROM labour_assignments la
            JOIN labour_tasks lt ON la.task_id = lt.task_id
            JOIN users u ON la.user_id = u.id
            WHERE la.assignment_id = ?
        `;
        const [assignment] = await pool.query(query, [assignment_id]);
        
        if (!assignment) {
            throw new Error('Assignment not found');
        }

        const total_amount = assignment.days_worked * assignment.daily_wage;
        
        // Create salary slip
        const slipQuery = 'INSERT INTO salary_slips (assignment_id, total_amount) VALUES (?, ?)';
        await pool.query(slipQuery, [assignment_id, total_amount]);

        return {
            ...assignment,
            total_amount
        };
    }

    // Get salary slip
    static async getSalarySlip(slip_id) {
        const query = `
            SELECT ss.*, la.days_worked, lt.task_name, lt.daily_wage, u.name
            FROM salary_slips ss
            JOIN labour_assignments la ON ss.assignment_id = la.assignment_id
            JOIN labour_tasks lt ON la.task_id = lt.task_id
            JOIN users u ON la.user_id = u.id
            WHERE ss.slip_id = ?
        `;
        const [slip] = await pool.query(query, [slip_id]);
        return slip;
    }
}

module.exports = LabourModel; 