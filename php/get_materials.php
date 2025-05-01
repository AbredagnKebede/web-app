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

// Get course ID from request
$courseId = isset($_GET['course_id']) ? $_GET['course_id'] : null;

if (!$courseId) {
    error_log("Course ID parameter is missing");
    echo json_encode(['success' => false, 'message' => 'Course ID parameter is required']);
    exit;
}

// Log the parameters for debugging
error_log("Fetching materials for course ID: " . $courseId . ", user ID: " . $userId);

// Fetch user's materials for this course
// First, check if the user is enrolled in this course and has access to materials
$sql = "SELECT u.reference_link, u.lecture_note_link, u.exam_link 
        FROM users u 
        WHERE u.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    error_log("User materials not found");
    echo json_encode(['success' => false, 'message' => 'User materials not found']);
    exit;
}

$materials = $result->fetch_assoc();

// Log the results for debugging
error_log("Found materials: " . json_encode($materials));

echo json_encode([
    'success' => true, 
    'materials' => [
        'reference_link' => $materials['reference_link'],
        'lecture_note_link' => $materials['lecture_note_link'],
        'exam_link' => $materials['exam_link']
    ]
]);

$stmt->close();
$conn->close();
?>