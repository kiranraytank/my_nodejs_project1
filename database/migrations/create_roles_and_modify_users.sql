-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('labare', 'Labor worker for construction'),
('manager', 'Project manager for construction sites'),
('contacter', 'Contractor for construction projects');

-- Modify users table to use role_id
ALTER TABLE users 
ADD COLUMN role_id INT AFTER email,
ADD FOREIGN KEY (role_id) REFERENCES roles(id),
DROP COLUMN type; 