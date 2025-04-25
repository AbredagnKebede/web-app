<?php
// filepath: c:\xampp\htdocs\registration page\api\courses.php
header("Content-Type: application/json");
require_once 'check_session.php'; // Includes session and login validation
require_once 'connect.php'; // Use the shared database connection

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT academic_year, department_id FROM USERS WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found.']);
    exit;
}

$academic_year = $user['academic_year'];
$department_id = $user['department_id'];

$stmt = $conn->prepare("
    SELECT title, code, semester, academic_year 
    FROM COURSES 
    WHERE academic_year = ? AND department_id = ?
");
$stmt->bind_param("ii", $academic_year, $department_id);
$stmt->execute();
$courses_result = $stmt->get_result();

$courses = [];
while ($row = $courses_result->fetch_assoc()) {
    $courses[] = $row;
}

echo json_encode(['courses' => $courses]);
$conn->close();
?>
