<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "bare@coat";
$dbname = "sekay";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get semester ID from request
$semester = isset($_GET['semester']) ? $_GET['semester'] : null;

if (!$semester) {
    echo json_encode(['success' => false, 'message' => 'Semester parameter is required']);
    exit;
}

// Get user ID from session (if you're tracking logged-in users)
session_start();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

// Fetch courses for the selected semester
$sql = "SELECT * FROM courses WHERE semester = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $semester);
$stmt->execute();
$result = $stmt->get_result();

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