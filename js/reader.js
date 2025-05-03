document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const materialType = urlParams.get('material_type');
    const courseId = urlParams.get('course_id');
    const materialUrl = urlParams.get('material_url');
    
    // Set up breadcrumb navigation
    document.getElementById('coursesLink').href = `courses.html?semester=${urlParams.get('semester') || '1'}`;
    document.getElementById('materialsLink').href = `materials.html?course_id=${courseId}`;
    
    // Set material type in breadcrumb and title
    let materialTitle = '';
    switch(materialType) {
        case 'reference':
            materialTitle = 'Reference Materials';
            break;
        case 'lecture':
            materialTitle = 'Lecture Notes';
            break;
        case 'exam':
            materialTitle = 'Exam Materials';
            break;
        default:
            materialTitle = 'Course Material';
    }
    
    // Update to use the correct element ID: documentType instead of materialTypeCrumb
    document.getElementById('documentType').textContent = materialTitle;
    // Update to use the correct element ID: documentTitle instead of materialTitle
    document.getElementById('documentTitle').textContent = materialTitle;
    document.title = `${materialTitle} | Sekay`;
    
    // Load the document in the iframe
    if (materialUrl) {
        document.getElementById('documentViewer').src = materialUrl;
    } else {
        showError('Material URL not provided');
    }
    
    // Set up download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (materialUrl) {
                // Create a temporary anchor element to trigger download
                const a = document.createElement('a');
                a.href = materialUrl;
                a.download = `${materialTitle.replace(/\s+/g, '_')}.pdf`; // Default to PDF extension
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert('No material available to download');
            }
        });
    }
    
    // Set up AI assistant
    const aiAssistantButton = document.getElementById('aiAssistantButton');
    const aiChatWindow = document.getElementById('aiChatWindow');
    const closeAiChat = document.getElementById('closeAiChat');
    const askAiBtn = document.getElementById('askAiBtn');
    
    // Toggle AI chat window
    function toggleAiChat() {
        if (aiChatWindow.style.display === 'flex') {
            aiChatWindow.style.display = 'none';
        } else {
            aiChatWindow.style.display = 'flex';
        }
    }
    
    aiAssistantButton.addEventListener('click', toggleAiChat);
    closeAiChat.addEventListener('click', function() {
        aiChatWindow.style.display = 'none';
    });
    askAiBtn.addEventListener('click', toggleAiChat);
    
    // Handle sending messages to AI
    const sendAiMessage = document.getElementById('sendAiMessage');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatMessages = document.getElementById('aiChatMessages');
    const imageUpload = document.getElementById('imageUpload');
    
    sendAiMessage.addEventListener('click', function() {
        sendMessageToAi();
    });
    
    aiChatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageToAi();
        }
    });
    
    const imageUpload = document.getElementById('imageUpload');
    
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                sendImageToAi(file);
            } else {
                alert('Please select an image file');
            }
        }
    });
    
    function sendMessageToAi() {
        const message = aiChatInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessageToChat(message, 'user');
            
            // Clear input
            aiChatInput.value = '';
            
            // Send to Gemini API
            sendToGeminiApi(message, null);
        }
    }
    
    function sendImageToAi(imageFile) {
        // Add a placeholder message
        addMessageToChat('Sending image...', 'user');
        
        // Create a reader to read the image file
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Send to Gemini API with image
            sendToGeminiApi('What can you tell me about this image?', imageData);
        };
        reader.readAsDataURL(imageFile);
    }
    
    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';
        messageElement.innerHTML = `<p>${message}</p>`;
        aiChatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
    
    function sendToGeminiApi(message, imageData) {
        // Show loading indicator
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'ai-message';
        loadingMessage.innerHTML = '<p>Thinking...</p>';
        aiChatMessages.appendChild(loadingMessage);
        
        // Prepare data for Gemini API
        const requestData = {
            message: message,
            materialType: materialType,
            materialUrl: materialUrl,
            courseId: courseId
        };
        
        if (imageData) {
            requestData.image = imageData;
        }
        
        // Send to your backend which will forward to Gemini
        fetch('../api/gemini_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            // Remove loading message
            aiChatMessages.removeChild(loadingMessage);
            
            if (data.success) {
                // Add AI response to chat
                addMessageToChat(data.response, 'ai');
            } else {
                // Show error
                addMessageToChat('Sorry, I encountered an error: ' + data.message, 'ai');
            }
        })
        .catch(error => {
            // Remove loading message
            aiChatMessages.removeChild(loadingMessage);
            
            // Show error
            addMessageToChat('Sorry, I encountered an error connecting to the AI service. Please try again later.', 'ai');
            console.error('Error:', error);
        });
    }
    
    function showError(message) {
        const container = document.querySelector('.reader-container');
        container.innerHTML = `
            <div class="error-message" style="padding: 20px; text-align: center;">
                <p>${message}</p>
                <button onclick="window.history.back()" class="btn-primary">Go Back</button>
            </div>
        `;
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    function getUrlParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');
        
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            params[key] = decodeURIComponent(value || '');
        }
        
        return params;
    }
    
    const params = getUrlParams();
    const courseId = params.course_id;
    const courseName = params.course_name;
    const materialType = params.material_type;
    const materialUrl = params.material_url;
    
    // Update breadcrumb and document title
    document.getElementById('coursesLink').href = `courses.html?semester=${params.semester || ''}`;
    document.getElementById('materialsLink').href = `materials.html?course_id=${courseId}&course_name=${encodeURIComponent(courseName)}`;
    
    // Set document type in breadcrumb
    const documentTypeSpan = document.getElementById('documentType');
    const documentTitle = document.getElementById('documentTitle');
    
    if (materialType === 'references') {
        documentTypeSpan.textContent = 'References';
        documentTitle.textContent = 'Reference Material';
    } else if (materialType === 'lecture-notes') {
        documentTypeSpan.textContent = 'Lecture Notes';
        documentTitle.textContent = 'Lecture Notes';
    } else if (materialType === 'exams') {
        documentTypeSpan.textContent = 'Exams';
        documentTitle.textContent = 'Exam Material';
    } else {
        documentTypeSpan.textContent = 'Document';
        documentTitle.textContent = 'Course Material';
    }
    
    // Load the document in the iframe
    const documentViewer = document.getElementById('documentViewer');
    if (materialUrl && materialUrl !== 'undefined') {
        // For Google Drive links, ensure they use the preview format
        let embedUrl = materialUrl;
        if (embedUrl.includes('drive.google.com') && embedUrl.includes('/view')) {
            embedUrl = embedUrl.replace('/view', '/preview');
        }
        documentViewer.src = embedUrl;
    } else {
        documentViewer.srcdoc = '<div style="display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;color:#666;"><p>No document URL provided</p></div>';
    }
    
    // Set up download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (materialUrl && materialUrl !== 'undefined') {
        // For Google Drive, convert preview URL to download URL if needed
        let downloadUrl = materialUrl;
        if (downloadUrl.includes('drive.google.com') && downloadUrl.includes('/preview')) {
            downloadUrl = downloadUrl.replace('/preview', '/view?usp=download');
        }
        downloadBtn.href = downloadUrl;
    } else {
        downloadBtn.style.display = 'none';
    }
    
    // Set up dark mode toggle
    const lightModeBtn = document.getElementById('lightModeBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    
    lightModeBtn.addEventListener('click', function() {
        document.body.classList.remove('dark-mode');
        lightModeBtn.classList.add('active');
        darkModeBtn.classList.remove('active');
        localStorage.setItem('theme', 'light');
    });
    
    darkModeBtn.addEventListener('click', function() {
        document.body.classList.add('dark-mode');
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
        localStorage.setItem('theme', 'dark');
    });
    
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
    }
    
    // Set up profile link
    const profileLink = document.getElementById('profileLink');
    profileLink.href = 'profile.html';
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        // Clear session storage
        sessionStorage.clear();
        // Redirect to login page
        window.location.href = 'login.html';
    });
    
    // Set up AI assistant
    const aiAssistantButton = document.getElementById('aiAssistantButton');
    const aiChatWindow = document.getElementById('aiChatWindow');
    const closeAiChat = document.getElementById('closeAiChat');
    const sendAiMessage = document.getElementById('sendAiMessage');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatMessages = document.getElementById('aiChatMessages');
    
    aiAssistantButton.addEventListener('click', function() {
        aiChatWindow.style.display = aiChatWindow.style.display === 'block' ? 'none' : 'block';
    });
    
    closeAiChat.addEventListener('click', function() {
        aiChatWindow.style.display = 'none';
    });
    
    // Set up Ask AI button
    const askAiBtn = document.getElementById('askAiBtn');
    askAiBtn.addEventListener('click', function() {
        aiChatWindow.style.display = 'block';
    });
ng     // Add this after your other event listeners
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', function() {
            imageUpload.click();
        });
    }
});