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

// Fetch materials for this course from the courses table
$sql = "SELECT reference_link, lecture_note_link, exam_link 
        FROM courses 
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $courseId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    error_log("Course materials not found");
    echo json_encode(['success' => false, 'message' => 'Course materials not found']);
    exit;
}

$materials = $result->fetch_assoc();

// Log the results for debugging
error_log("Found materials: " . json_encode($materials));

// Return the materials
echo json_encode([
    'success' => true,
    'materials' => $materials
]);

$stmt->close();
$conn->close();
?>