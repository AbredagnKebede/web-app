document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    const courseName = urlParams.get('course_name');
    const materialType = urlParams.get('material_type');
    const materialUrl = urlParams.get('material_url');
    
    // Update breadcrumb and document title
    updatePageInfo(courseName, materialType, materialUrl);
    
    // Set up document viewer
    setupDocumentViewer(materialUrl);
    
    // Set up download button
    setupDownloadButton(materialUrl);
    
    // Set up AI assistant
    setupAIAssistant();
    
    // Check session to ensure user is logged in
    checkUserSession();
});

/**
 * Updates the page information based on the document being viewed
 */
function updatePageInfo(courseName, materialType, materialUrl) {
    // Update document title based on material type
    const documentTitle = document.getElementById('documentTitle');
    const documentType = document.getElementById('documentType');
    const materialsLink = document.getElementById('materialsLink');
    
    // Set the materials link with course parameters
    if (courseName) {
        materialsLink.href = `materials.html?course_id=${encodeURIComponent(getUrlParam('course_id'))}&course_name=${encodeURIComponent(courseName)}`;
    }
    
    // Set document type in breadcrumb
    let typeText = 'Document';
    if (materialType) {
        switch(materialType.toLowerCase()) {
            case 'reference':
                typeText = 'Reference Material';
                break;
            case 'lecture':
                typeText = 'Lecture Notes';
                break;
            case 'exam':
                typeText = 'Exam Material';
                break;
            default:
                typeText = 'Document';
        }
    }
    documentType.textContent = typeText;
    
    // Set document title
    if (materialUrl) {
        // Extract filename from URL
        const filename = materialUrl.split('/').pop();
        documentTitle.textContent = filename || 'Document';
    } else {
        documentTitle.textContent = typeText;
    }
    
    // Update page title
    document.title = `${documentTitle.textContent} | Sekay`;
}

/**
 * Sets up the document viewer iframe
 */
function setupDocumentViewer(materialUrl) {
    const documentViewer = document.getElementById('documentViewer');
    
    if (materialUrl) {
        // For PDFs, use Google PDF Viewer as fallback if browser doesn't support PDF viewing
        if (materialUrl.toLowerCase().endsWith('.pdf')) {
            documentViewer.src = `https://docs.google.com/viewer?url=${encodeURIComponent(materialUrl)}&embedded=true`;
        } else {
            documentViewer.src = materialUrl;
        }
    } else {
        // Show error if no URL provided
        documentViewer.srcdoc = `
            <html>
                <body style="display: flex; justify-content: center; align-items: center; height: 100%; font-family: Arial, sans-serif; color: #666;">
                    <div style="text-align: center;">
                        <h2>Document Not Available</h2>
                        <p>The requested document could not be loaded.</p>
                    </div>
                </body>
            </html>
        `;
    }
}

/**
 * Sets up the download button functionality
 */
function setupDownloadButton(materialUrl) {
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (materialUrl) {
        downloadBtn.href = materialUrl;
        downloadBtn.download = materialUrl.split('/').pop() || 'document';
    } else {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Document not available for download');
        });
    }
}

/**
 * Sets up the AI assistant modal and functionality
 */
function setupAIAssistant() {
    const askAiBtn = document.getElementById('askAiBtn');
    
    // Create AI modal if it doesn't exist
    if (!document.getElementById('aiModal')) {
        createAIModal();
    }
    
    // Set up AI button click handler
    askAiBtn.addEventListener('click', function() {
        document.getElementById('aiModal').style.display = 'flex';
    });
}

/**
 * Creates the AI assistant modal
 */
function createAIModal() {
    const modal = document.createElement('div');
    modal.id = 'aiModal';
    modal.className = 'ai-modal-container';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="ai-modal-content">
            <div class="ai-modal-header">
                <h3>Ask AI Assistant</h3>
                <button class="close-modal" id="closeAiModal">&times;</button>
            </div>
            <div class="ai-modal-body">
                <div class="ai-input-section">
                    <textarea id="aiPrompt" placeholder="Ask a question about this document..."></textarea>
                    <div class="ai-controls">
                        <button class="btn-secondary" id="clearPromptBtn">Clear</button>
                        <button class="btn-primary" id="submitPromptBtn">Ask AI</button>
                    </div>
                </div>
                <div class="ai-response-container" id="aiResponseContainer" style="display: none;">
                    <h4>AI Response</h4>
                    <div class="ai-response" id="aiResponse"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up event listeners for modal
    document.getElementById('closeAiModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    document.getElementById('clearPromptBtn').addEventListener('click', function() {
        document.getElementById('aiPrompt').value = '';
    });
    
    document.getElementById('submitPromptBtn').addEventListener('click', function() {
        const prompt = document.getElementById('aiPrompt').value.trim();
        if (prompt) {
            handleAIPrompt(prompt);
        }
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Handles AI prompt submission
 */
function handleAIPrompt(prompt) {
    const responseContainer = document.getElementById('aiResponseContainer');
    const aiResponse = document.getElementById('aiResponse');
    
    // Show loading state
    responseContainer.style.display = 'block';
    aiResponse.innerHTML = '<p>Thinking...</p>';
    
    // Get document context information
    const materialType = getUrlParam('material_type') || '';
    const materialUrl = getUrlParam('material_url') || '';
    const courseId = getUrlParam('course_id') || '';
    
    // Prepare data for API request
    const requestData = {
        message: prompt,
        materialType: materialType,
        materialUrl: materialUrl,
        courseId: courseId
    };
    
    // Make API call to Gemini API endpoint
    fetch('../api/gemini_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Format the response with markdown-to-html conversion
            aiResponse.innerHTML = formatAIResponse(data.response);
        } else {
            aiResponse.innerHTML = `<p class="ai-error">Error: ${data.message || 'Failed to get response from AI'}</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        aiResponse.innerHTML = '<p class="ai-error">An error occurred while communicating with the AI service.</p>';
    });
}

/**
 * Helper function to format AI response text with basic markdown support
 */
function formatAIResponse(text) {
    if (!text) return '';
    
    // Convert markdown to HTML (basic implementation)
    // Replace ** for bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace * for italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Replace inline code
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    // Replace line breaks with <br>
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

/**
 * Helper function to get URL parameters
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Checks if user is logged in
 */
function checkUserSession() {
    fetch('../api/check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedin) {
                // Redirect to login page if not logged in
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
        });
}