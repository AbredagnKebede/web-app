<?php
session_start();
header('Content-Type: application/json');
require_once 'connect.php'; // Corrected path (same directory)

$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $email = trim($_POST["email"]);
    $password = $_POST["password"];
    
    // Validate email
    if (empty($email)) {
        $response['errors']['email'] = "Email is required";
    }
    
    // Validate password
    if (empty($password)) {
        $response['errors']['password'] = "Password is required";
    }
    
    // If no validation errors, check login credentials
    if (empty($response['errors'])) {
        $stmt = $conn->prepare("SELECT id, name, password_hash FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            if (password_verify($password, $user['password_hash'])) {
                // Login successful
                $_SESSION['loggedin'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['name'] = $user['name'];
                
                $response['success'] = true;
                $response['message'] = "Login successful! Redirecting...";
            } else {
                $response['message'] = "Invalid email or password";
            }
        } else {
            $response['message'] = "Invalid email or password";
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