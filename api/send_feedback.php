<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Get the request data
$requestData = json_decode(file_get_contents('php://input'), true);

if (!$requestData) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

// Extract data from request
$name = isset($requestData['name']) ? $requestData['name'] : 'Anonymous';
$email = isset($requestData['email']) ? $requestData['email'] : 'No email provided';
$feedback = isset($requestData['feedback']) ? $requestData['feedback'] : '';

// Validate required fields
if (empty($feedback)) {
    echo json_encode(['success' => false, 'message' => 'Feedback message is required']);
    exit;
}

// Email recipient
$to = 'abredagn@gmail.com';

// Email subject
$subject = 'New Feedback from Sekay Website';

// Email message
$message = "
<html>
<head>
    <title>New Feedback</title>
</head>
<body>
    <h2>New Feedback Received</h2>
    <p><strong>Name:</strong> $name</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Feedback:</strong></p>
    <p>$feedback</p>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Sekay Website <noreply@sekay.com>" . "\r\n";

// Send email
$mailSent = mail($to, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => 'Thank you for your feedback!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send feedback. Please try again later.']);
}
?>