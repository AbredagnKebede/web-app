<?php
// Database connection
require_once '../../api/connect.php';
session_start();

// Check if user is logged in as admin
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all courses or filter by department and/or semester
        $department_id = isset($_GET['department_id']) ? $_GET['department_id'] : null;
        $semester = isset($_GET['semester']) ? $_GET['semester'] : null;
        
        $sql = "SELECT c.id, c.code, c.title, c.semester, c.year, d.name as department_name, c.department_id 
                FROM courses c 
                JOIN departments d ON c.department_id = d.id 
                WHERE 1=1";
        
        $params = [];
        $types = "";
        
        if ($department_id) {
            $sql .= " AND c.department_id = ?";
            $params[] = $department_id;
            $types .= "i";
        }
        
        if ($semester) {
            $sql .= " AND c.semester = ?";
            $params[] = $semester;
            $types .= "s";
        }
        
        $sql .= " ORDER BY c.year DESC, c.semester, c.code";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result) {
            $courses = [];
            while ($row = $result->fetch_assoc()) {
                $courses[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $courses]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch courses']);
        }
        break;
        
    case 'POST':
        // Add new course
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['code']) || empty($data['code']) || 
            !isset($data['title']) || empty($data['title']) || 
            !isset($data['department_id']) || empty($data['department_id']) || 
            !isset($data['semester']) || empty($data['semester']) || 
            !isset($data['year']) || empty($data['year'])) {
            
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }
        
        // Check for duplicate course code
        $check_sql = "SELECT id FROM courses WHERE code = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $data['code']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Course code already exists']);
            exit;
        }
        
        // Insert new course
        $insert_sql = "INSERT INTO courses (code, title, department_id, semester, year) VALUES (?, ?, ?, ?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param("ssisi", $data['code'], $data['title'], $data['department_id'], $data['semester'], $data['year']);
        
        if ($insert_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Course added successfully', 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add course']);
        }
        break;
        
    case 'PUT':
        // Update course
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['id']) || 
            !isset($data['code']) || empty($data['code']) || 
            !isset($data['title']) || empty($data['title']) || 
            !isset($data['department_id']) || empty($data['department_id']) || 
            !isset($data['semester']) || empty($data['semester']) || 
            !isset($data['year']) || empty($data['year'])) {
            
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }
        
        // Check for duplicate course code (excluding current course)
        $check_sql = "SELECT id FROM courses WHERE code = ? AND id != ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("si", $data['code'], $data['id']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Course code already exists']);
            exit;
        }
        
        // Update course
        $update_sql = "UPDATE courses SET code = ?, title = ?, department_id = ?, semester = ?, year = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("ssisii", $data['code'], $data['title'], $data['department_id'], $data['semester'], $data['year'], $data['id']);
        
        if ($update_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Course updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update course']);
        }
        break;
        
    case 'DELETE':
        // Delete course
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Course ID is required']);
            exit;
        }
        
        // Check if course has associated materials
        $check_sql = "SELECT COUNT(*) as material_count FROM course_materials WHERE course_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("i", $id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $material_count = $check_result->fetch_assoc()['material_count'];
        
        if ($material_count > 0) {
            echo json_encode(['success' => false, 'message' => 'Cannot delete. Remove associated materials first.']);
            exit;
        }
        
        // Delete course
        $delete_sql = "DELETE FROM courses WHERE id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param("i", $id);
        
        if ($delete_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Course deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete course']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>