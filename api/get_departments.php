<?php
header('Content-Type: application/json');
require_once '../api/connect.php'; // Updated path

// Fetch departments from database
$sql = "SELECT * FROM departments ORDER BY name";
$result = $conn->query($sql);
$departments = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
}

echo json_encode($departments);
$conn->close();
?>