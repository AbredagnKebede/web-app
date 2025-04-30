<?php
// Database connection
require_once '../api/connect.php';
// Start session to get user info
session_start();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$userId) {
    error_log("User not logged in");
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Get user's department_id and academic_year
$userSql = "SELECT u.department_id, u.academic_year FROM users u WHERE u.id = ?";
$userStmt = $conn->prepare($userSql);
$userStmt->bind_param("i", $userId);
$userStmt->execute();
$userResult = $userStmt->get_result();

if ($userResult->num_rows == 0) {
    error_log("User information not found");
    echo json_encode(['success' => false, 'message' => 'User information not found']);
    exit;
}

$userInfo = $userResult->fetch_assoc();
$departmentId = $userInfo['department_id'];
$academicYear = $userInfo['academic_year'];
$userStmt->close();

// Get semester ID from request
$semester = isset($_GET['semester']) ? $_GET['semester'] : null;

if (!$semester) {
    error_log("Semester parameter is missing");
    echo json_encode(['success' => false, 'message' => 'Semester parameter is required']);
    exit;
}

// Log the parameters for debugging
error_log("Fetching courses for semester: " . $semester . ", department: " . $departmentId . ", academic year: " . $academicYear);

// Fetch courses for the selected semester, user's department and academic year
$sql = "SELECT c.*, d.name as department_name 
        FROM courses c 
        JOIN departments d ON c.department_id = d.id 
        WHERE c.semester = ? AND c.department_id = ? AND c.academic_year = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $semester, $departmentId, $academicYear);
$stmt->execute();
$result = $stmt->get_result();

// Log the SQL query result
error_log("Query executed. Found " . $result->num_rows . " courses");

$courses = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    echo json_encode(['success' => true, 'courses' => $courses]);
} else {
    echo json_encode(['success' => true, 'courses' => []]);
}

$stmt->close();
$conn->close();
?>