<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "bare@coat"; // Make sure this is correct
$dbname = "sekay";

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Get semester ID from request
$semester = isset($_GET['semester']) ? $_GET['semester'] : null;

if (!$semester) {
    error_log("Semester parameter is missing");
    echo json_encode(['success' => false, 'message' => 'Semester parameter is required']);
    exit;
}

// Log the semester value for debugging
error_log("Fetching courses for semester: " . $semester);

// Fetch courses for the selected semester
$sql = "SELECT * FROM courses WHERE semester = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $semester);
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