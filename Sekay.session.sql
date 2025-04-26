use sekay;

CREATE TABLE DEPARTMENTS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL
);

CREATE TABLE USERS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    academic_year INT,
    department_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENTS(id)
);

CREATE TABLE COURSES (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    department_id INT,
    semester INT,
    academic_year INT,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENTS(id)
);

CREATE TABLE MATERIALS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    title VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    type ENUM('lecture', 'assignment', 'notes', 'exam') NOT NULL,
    chapter INT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    avg_rating FLOAT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES COURSES(id)
);

CREATE TABLE RATINGS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    material_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(id),
    FOREIGN KEY (material_id) REFERENCES MATERIALS(id)
);

CREATE TABLE FEEDBACK (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    message TEXT NOT NULL,
    type ENUM('bug', 'suggestion', 'general') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(id)
);
INSERT INTO DEPARTMENTS (name, code) VALUES
-- School of Applied Natural Sciences
('Applied Biology', 'BIO'),
('Applied Chemistry', 'CHE'),
('Applied Geology', 'GEO'),
('Applied Mathematics', 'MAT'),
('Applied Physics', 'PHY'),
('Pharmacy', 'PHA'),

-- School of Civil Engineering and Architecture
('Architecture', 'ARC'),
('Civil Engineering', 'CIV'),
('Water Resources Engineering', 'WRE'),

-- School of Electrical Engineering and Computing
('Software Engineering', 'SWE'),
('Computer Science and Engineering', 'CSE'),
('Electronics and Communication Engineering', 'ECE'),
('Electrical Power and Control Engineering', 'EPCE'),

-- School of Mechanical, Chemical, and Materials Engineering
('Chemical Engineering', 'CHEE'),
('Materials Science and Engineering', 'MSE'),
('Mechanical Engineering', 'ME');
ALTER TABLE USERS
MODIFY academic_year VARCHAR(20);
ALTER TABLE DEPARTMENTS DROP COLUMN code;
ALTER TABLE courses
ADD COLUMN reference_link TEXT,
ADD COLUMN lecture_note_link TEXT,
ADD COLUMN exam_link TEXT;
INSERT INTO courses (
    title, code, department_id, semester, academic_year, 
    reference_link, lecture_note_link, exam_link
) 
VALUES 
('Object-Oriented Programming', 'SE201', 10, 2, 'Junior', 
 'https://example.com/references/oop', 
 'https://example.com/lectures/oop', 
 'https://example.com/exams/oop'),

('Software Engineering Principles', 'SE202', 10, 2, 'Junior', 
 'https://example.com/references/se-principles', 
 'https://example.com/lectures/se-principles', 
 'https://example.com/exams/se-principles'),

('UI/UX Design', 'SE203', 10, 2, 'Junior', 
 'https://example.com/references/uiux', 
 'https://example.com/lectures/uiux', 
 'https://example.com/exams/uiux');
 