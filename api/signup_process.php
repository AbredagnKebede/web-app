<?php
header('Content-Type: application/json');
require_once 'connect.php';

$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = trim($_POST["name"]);
    $email = trim($_POST["email"]);
    $academicYear = trim($_POST["academic_year"]);
    $department = trim($_POST["department"]);
    $password = $_POST["password"];
    $confirmPassword = $_POST["confirm_password"];
    
    // Validate name
    if (empty($name)) {
        $response['errors']['name'] = "Name is required";
    } elseif (!preg_match("/^[a-zA-Z ]*$/", $name)) {
        $response['errors']['name'] = "Only letters and white space allowed";
    }
    
    // Validate email
    if (empty($email)) {
        $response['errors']['email'] = "Email is required";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['errors']['email'] = "Invalid email format";
    } else {
        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();
        
        if ($stmt->num_rows > 0) {
            $response['errors']['email'] = "Email already exists";
        }
        $stmt->close();
    }
    
    // Validate academic year
    if (empty($academicYear)) {
        $response['errors']['academicYear'] = "Academic year is required";
    }
    
    // Validate department
    if (empty($department)) {
        $response['errors']['department'] = "Department is required";
    }
    
    // Validate password
    if (empty($password)) {
        $response['errors']['password'] = "Password is required";
    } elseif (strlen($password) < 6) {
        $response['errors']['password'] = "Password must be at least 6 characters";
    }
    
    // Validate confirm password
    if (empty($confirmPassword)) {
        $response['errors']['confirmPassword'] = "Please confirm your password";
    } elseif ($password != $confirmPassword) {
        $response['errors']['confirmPassword'] = "Passwords do not match";
    }
    
    // If no validation errors, insert user into database
    if (empty($response['errors'])) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $conn->prepare("INSERT INTO users (name, email, academic_year, department, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $email, $academicYear, $department, $hashed_password);
        
        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Registration successful! You can now login.";
        } else {
            $response['message'] = "Error: " . $stmt->error;
        }
        
        $stmt->close();
    } else {
        $response['message'] = "Please fix the errors and try again.";
    }
} else {
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
$conn->close();
?>