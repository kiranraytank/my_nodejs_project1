-- Labour Management Tables

-- Labour Tasks Table
CREATE TABLE IF NOT EXISTS labour_tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(100) NOT NULL,
    description TEXT,
    daily_wage DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Labour Assignments Table
CREATE TABLE IF NOT EXISTS labour_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_worked INT NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES labour_tasks(task_id)
);

-- Salary Slips Table
CREATE TABLE IF NOT EXISTS salary_slips (
    slip_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES labour_assignments(assignment_id)
); 