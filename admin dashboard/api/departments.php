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
        
        // Get all departments
        $sql = "SELECT d.id, d.name, d.description, COUNT(c.id) as course_count 
                FROM departments d 
                LEFT JOIN courses c ON d.id = c.department_id 
                GROUP BY d.id";
        $result = $conn->query($sql);
        
        if ($result) {
            $departments = [];
            while ($row = $result->fetch_assoc()) {
                $departments[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $departments]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch departments']);
        }
        break;
        
    case 'POST':
        // Add new department
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['name']) || empty($data['name'])) {
            echo json_encode(['success' => false, 'message' => 'Department name is required']);
            exit;
        }
        
        // Check for duplicate department name
        $check_sql = "SELECT id FROM departments WHERE name = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $data['name']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Department name already exists']);
            exit;
        }
        
        // Insert new department
        $description = isset($data['description']) ? $data['description'] : '';
        $insert_sql = "INSERT INTO departments (name, description) VALUES (?, ?)";
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param("ss", $data['name'], $description);
        
        if ($insert_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Department added successfully', 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add department']);
        }
        break;
        
    case 'PUT':
        // Update department
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate input
        if (!isset($data['id']) || !isset($data['name']) || empty($data['name'])) {
            echo json_encode(['success' => false, 'message' => 'Department ID and name are required']);
            exit;
        }
        
        // Check for duplicate department name (excluding current department)
        $check_sql = "SELECT id FROM departments WHERE name = ? AND id != ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("si", $data['name'], $data['id']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Department name already exists']);
            exit;
        }
        
        // Update department
        $description = isset($data['description']) ? $data['description'] : '';
        $update_sql = "UPDATE departments SET name = ?, description = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("ssi", $data['name'], $description, $data['id']);
        
        if ($update_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Department updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update department']);
        }
        break;
        
    case 'DELETE':
        // Delete department
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Department ID is required']);
            exit;
        }
        
        // Check if department has associated courses
        $check_sql = "SELECT COUNT(*) as course_count FROM courses WHERE department_id = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("i", $id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $course_count = $check_result->fetch_assoc()['course_count'];
        
        if ($course_count > 0) {
            echo json_encode(['success' => false, 'message' => 'Cannot delete. Reassign or remove associated courses first.']);
            exit;
        }
        
        // Delete department
        $delete_sql = "DELETE FROM departments WHERE id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param("i", $id);
        
        if ($delete_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Department deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete department']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>