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
$subject = isset($requestData['subject']) ? $requestData['subject'] : 'No subject';
$message_content = isset($requestData['message']) ? $requestData['message'] : '';

// Validate required fields
if (empty($message_content)) {
    echo json_encode(['success' => false, 'message' => 'Message content is required']);
    exit;
}

// Email recipient
$to = 'abredagn@gmail.com';

// Email subject
$email_subject = "Developer Contact: $subject";

// Email message
$message = "
<html>
<head>
    <title>Developer Contact</title>
</head>
<body>
    <h2>New Developer Contact Message</h2>
    <p><strong>Name:</strong> $name</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Subject:</strong> $subject</p>
    <p><strong>Message:</strong></p>
    <p>$message_content</p>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Sekay Website <noreply@sekay.com>" . "\r\n";

// Send email
$mailSent = mail($to, $email_subject, $message, $headers);

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => 'Your message has been sent to the developers!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send message. Please try again later.']);
}
?>