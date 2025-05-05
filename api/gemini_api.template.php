<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log function for debugging
function logError($message) {
    error_log("[Gemini API Error] " . $message);
}

// Get the request data
$requestData = json_decode(file_get_contents('php://input'), true);

if (!$requestData) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

// Extract data from request
$message = isset($requestData['message']) ? $requestData['message'] : '';
$materialType = isset($requestData['materialType']) ? $requestData['materialType'] : '';
$materialUrl = isset($requestData['materialUrl']) ? $requestData['materialUrl'] : '';
$courseId = isset($requestData['courseId']) ? $requestData['courseId'] : '';
$imageData = isset($requestData['image']) ? $requestData['image'] : null;

// Validate required fields
if (empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Message is required']);
    exit;
}

// Your Gemini API key - store this securely in production
$apiKey = 'YOUR_API_KEY_HERE';

// Decide which model to use
if ($imageData) {
    // Use Gemini Pro Vision for image inputs
    $geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
} else {
    // Use Gemini 2.0 Flash for text
    $geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
}

$geminiEndpoint .= '?key=' . $apiKey;

// Prepare the content parts
$contentParts = [
    [
        'text' => "You are an AI assistant helping a student with their course materials. 
                  Material Type: $materialType
                  Course ID: $courseId
                  
                  The student asks: $message"
    ]
];

// Add image if provided
if ($imageData) {
    // Extract base64 data from data URL
    $imageData = preg_replace('#^data:image/\w+;base64,#i', '', $imageData);
    
    $contentParts[] = [
        'inlineData' => [
            'mimeType' => 'image/jpeg', // Adjust based on actual image type
            'data' => $imageData
        ]
    ];
}

// Prepare the request body
$requestBody = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => $contentParts
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.7,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 1024,
    ]
];

// Initialize cURL session
$ch = curl_init($geminiEndpoint);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

// Add verbose debugging
curl_setopt($ch, CURLOPT_VERBOSE, true);
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

// Execute cURL request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

// Log verbose output
rewind($verbose);
$verboseLog = stream_get_contents($verbose);
logError("Verbose cURL log: " . $verboseLog);

curl_close($ch);

// Check for cURL errors
if ($curlError) {
    logError("cURL Error: " . $curlError);
    echo json_encode(['success' => false, 'message' => 'Network error: ' . $curlError]);
    exit;
}

// Check for HTTP errors
if ($httpCode !== 200) {
    logError("HTTP Error $httpCode: $response");
    
    // Try to decode the error response
    $errorData = json_decode($response, true);
    $errorMessage = isset($errorData['error']['message']) ? $errorData['error']['message'] : 'Unknown error';
    
    echo json_encode(['success' => false, 'message' => "API Error ($httpCode): $errorMessage"]);
    exit;
}

// Parse the response
$responseData = json_decode($response, true);

// Log the response for debugging
logError("API Response: " . json_encode($responseData));

// Extract the generated text
if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'];
    echo json_encode(['success' => true, 'response' => $aiResponse]);
} else {
    logError("Failed to extract response text from: " . json_encode($responseData));
    echo json_encode(['success' => false, 'message' => 'Failed to get response from AI service']);
}
?>