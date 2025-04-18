<?php
session_start();

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Return success response
header('Content-Type: application/json');
echo json_encode(['success' => true]);
?>