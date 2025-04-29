<?php
// Start the session
session_start();

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Return success response
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>