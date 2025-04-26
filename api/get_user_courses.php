<?php
session_start();
header('Content-Type: application/json');
require_once 'connect.php';

// Check if user is logged in
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch user academic info
$user_query = $conn->prepare("SELECT academic_year, department_id FROM users WHERE id = ?");
$user_query->bind_param("i", $user_id);
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user_data = $user_result->fetch_assoc();
$academic_year = $user_data['academic_year'];
$department_id = $user_data['department_id'];

// Get semester from URL parameter (default to 1 if not provided)
$semester = isset($_GET['semester']) ? intval($_GET['semester']) : 1;

// Fetch courses for that year and department
$course_query = $conn->prepare("
    SELECT id, title as name, code, semester, 
           '3' as credit_hours, 'Dr. Faculty' as instructor, 'Core' as type,
           reference_link, lecture_note_link, exam_link 
    FROM courses 
    WHERE department_id = ? AND academic_year = ? AND semester = ?
");
$course_query->bind_param("isi", $department_id, $academic_year, $semester);
$course_query->execute();
$course_result = $course_query->get_result();

$courses = [];
while ($row = $course_result->fetch_assoc()) {
    $courses[] = $row;
}

// Debug information
error_log("User ID: $user_id, Academic Year: $academic_year, Department ID: $department_id");
error_log("Courses found: " . count($courses));

echo json_encode([
    'success' => true,
    'courses' => $courses
]);

$conn->close();
?>
