<?php
session_start();
header('Content-Type: application/json');

$response = [
    'loggedin' => false,
    'name' => ''
];

if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    $response['loggedin'] = true;
    $response['name'] = $_SESSION['name'];
}

echo json_encode($response);
?>