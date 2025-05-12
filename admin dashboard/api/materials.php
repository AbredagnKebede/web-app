<?php
// Database connection
require_once '../../api/connect.php';
session_start();

// Check if user is logged in as admin
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Create uploads directory if it doesn't exist
$upload_dir = '../uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all materials or filter by course
        $course_id = isset($_GET['course_id']) ? $_GET['course_id'] : null;
        
        $sql = "SELECT m.id, m.title, m.description, m.file_path, m.material_type, m.tags, 
                m.upload_date, c.code as course_code, c.title as course_title, m.course_id 
                FROM course_materials m 
                JOIN courses c ON m.course_id = c.id 
                WHERE 1=1";
        
        $params = [];
        $types = "";
        
        if ($course_id) {
            $sql .= " AND m.course_id = ?";
            $params[] = $course_id;
            $types .= "i";
        }
        
        $sql .= " ORDER BY m.upload_date DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result) {
            $materials = [];
            while ($row = $result->fetch_assoc()) {
                $materials[] = $row;
            }
            echo json_encode(['success' => true, 'data' => $materials]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch materials']);
        }
        break;
        
    case 'POST':
        // Handle file upload
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'File upload failed']);
            exit;
        }
        
        // Validate file type
        $allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        $file_type = $_FILES['file']['type'];
        
        if (!in_array($file_type, $allowed_types)) {
            echo json_encode(['success' => false, 'message' => 'Only PDF and DOC files are allowed']);
            exit;
        }
        
        // Validate other fields
        if (!isset($_POST['course_id']) || empty($_POST['course_id']) || 
            !isset($_POST['title']) || empty($_POST['title']) || 
            !isset($_POST['material_type']) || empty($_POST['material_type'])) {
            
            echo json_encode(['success' => false, 'message' => 'Course, title, and material type are required']);
            exit;
        }
        
        // Generate unique filename
        $file_extension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid() . '.' . $file_extension;
        $file_path = $upload_dir . $new_filename;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
            // Save file info to database
            $description = isset($_POST['description']) ? $_POST['description'] : '';
            $tags = isset($_POST['tags']) ? $_POST['tags'] : '';
            
            $insert_sql = "INSERT INTO course_materials (course_id, title, description, file_path, material_type, tags, upload_date) 
                          VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $insert_stmt = $conn->prepare($insert_sql);
            $relative_path = 'uploads/' . $new_filename;
            $insert_stmt->bind_param("isssss", $_POST['course_id'], $_POST['title'], $description, $relative_path, $_POST['material_type'], $tags);
            
            if ($insert_stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Material uploaded successfully', 'id' => $conn->insert_id]);
            } else {
                // Delete file if database insert fails
                unlink($file_path);
                echo json_encode(['success' => false, 'message' => 'Failed to save material information']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
        }
        break;
        
    case 'DELETE':
        // Delete material
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Material ID is required']);
            exit;
        }
        
        // Get file path before deleting record
        $file_sql = "SELECT file_path FROM course_materials WHERE id = ?";
        $file_stmt = $conn->prepare($file_sql);
        $file_stmt->bind_param("i", $id);
        $file_stmt->execute();
        $file_result = $file_stmt->get_result();
        
        if ($file_result->num_rows > 0) {
            $file_path = $file_result->fetch_assoc()['file_path'];
            
            // Delete record from database
            $delete_sql = "DELETE FROM course_materials WHERE id = ?";
            $delete_stmt = $conn->prepare($delete_sql);
            $delete_stmt->bind_param("i", $id);
            
            if ($delete_stmt->execute()) {
                // Delete file from server
                $full_path = '../' . $file_path;
                if (file_exists($full_path)) {
                    unlink($full_path);
                }
                
                echo json_encode(['success' => true, 'message' => 'Material deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete material']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Material not found']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>