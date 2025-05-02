<?php
// Set headers for JSON response
header('Content-Type: application/json');

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
$apiKey = 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key

// Prepare the request to Gemini API
$geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
if ($imageData) {
    // Use gemini-pro-vision for image inputs
    $geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
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

// Execute cURL request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Check for errors
if ($httpCode !== 200) {
    error_log("Gemini API error: $response");
    echo json_encode(['success' => false, 'message' => 'Error communicating with AI service']);
    exit;
}

// Parse the response
$responseData = json_decode($response, true);

// Extract the generated text
if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'];
    echo json_encode(['success' => true, 'response' => $aiResponse]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to get response from AI service']);
}
?>