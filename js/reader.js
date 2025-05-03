document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    const courseName = urlParams.get('course_name');
    const materialType = urlParams.get('material_type');
    const materialUrl = urlParams.get('material_url');
    const semester = urlParams.get('semester') || '';
    
    // Update breadcrumb and document title
    document.getElementById('coursesLink').href = `courses.html?semester=${semester}`;
    document.getElementById('materialsLink').href = `materials.html?course_id=${courseId}&course_name=${encodeURIComponent(courseName)}`;
    
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
    
    // Update page elements with material information
    const materialTypeCrumb = document.getElementById('materialTypeCrumb');
    const documentTitle = document.getElementById('documentTitle');
    
    if (materialTypeCrumb) materialTypeCrumb.textContent = materialTitle;
    if (documentTitle) documentTitle.textContent = materialTitle;
    document.title = `${materialTitle} | Sekay`;
    
    // Set up document viewer
    const documentViewer = document.getElementById('documentViewer') || document.getElementById('documentFrame');
    if (documentViewer) {
        if (materialUrl && materialUrl !== 'undefined' && materialUrl !== '#') {
            // For Google Drive links, ensure they use the preview format
            let embedUrl = materialUrl;
            if (embedUrl.includes('drive.google.com') && embedUrl.includes('/view')) {
                embedUrl = embedUrl.replace('/view', '/preview');
            }
            documentViewer.src = embedUrl;
        } else {
            documentViewer.srcdoc = '<div style="display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;color:#666;"><p>No document available to display.</p></div>';
        }
    }
    
    // Set up download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        if (materialUrl && materialUrl !== 'undefined' && materialUrl !== '#') {
            // For Google Drive, convert preview URL to download URL if needed
            let downloadUrl = materialUrl;
            if (downloadUrl.includes('drive.google.com') && downloadUrl.includes('/preview')) {
                downloadUrl = downloadUrl.replace('/preview', '/view?usp=download');
            }
            downloadBtn.href = downloadUrl;
            downloadBtn.download = `${materialTitle.replace(/\s+/g, '_')}.pdf`;
        } else {
            downloadBtn.style.opacity = '0.5';
            downloadBtn.style.pointerEvents = 'none';
        }
    }
    
    // Set up dark mode toggle
    const lightModeBtn = document.getElementById('lightModeBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    
    if (lightModeBtn && darkModeBtn) {
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
    }
    
    // Set up profile link
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.href = 'profile.html';
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear session storage
            sessionStorage.clear();
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Set up AI assistant
    setupAiAssistant(materialType, courseId, materialUrl, materialTitle);
});

// Function to set up AI assistant
function setupAiAssistant(materialType, courseId, materialUrl, materialTitle) {
    // Check if AI elements exist
    const askAiBtn = document.getElementById('askAiBtn');
    
    if (askAiBtn) {
        // Create AI chat window elements if they don't exist
        let aiChatWindow = document.getElementById('aiChatWindow');
        let aiAssistantButton = document.getElementById('aiAssistantButton');
        
        if (!aiChatWindow) {
            // Create AI chat container if it doesn't exist
            const aiContainer = document.createElement('div');
            aiContainer.className = 'ai-assistant-container';
            document.body.appendChild(aiContainer);
            
            // Create AI chat window
            aiChatWindow = document.createElement('div');
            aiChatWindow.className = 'ai-chat-window';
            aiChatWindow.id = 'aiChatWindow';
            aiChatWindow.style.display = 'none';
            aiContainer.appendChild(aiChatWindow);
            
            // Create AI chat header
            const aiChatHeader = document.createElement('div');
            aiChatHeader.className = 'ai-chat-header';
            aiChatHeader.innerHTML = '<h3>AI Assistant</h3><button id="closeAiChat">×</button>';
            aiChatWindow.appendChild(aiChatHeader);
            
            // Create AI chat messages container
            const aiChatMessages = document.createElement('div');
            aiChatMessages.className = 'ai-chat-messages';
            aiChatMessages.id = 'aiChatMessages';
            aiChatMessages.innerHTML = '<div class="ai-message"><p>Hello! I\'m your Sekay assistant. How can I help you with this document?</p></div>';
            aiChatWindow.appendChild(aiChatMessages);
            
            // Create AI chat input area
            const aiChatInput = document.createElement('div');
            aiChatInput.className = 'ai-chat-input';
            aiChatInput.innerHTML = '<textarea id="aiChatInput" placeholder="Type your question..."></textarea><button id="sendAiMessage" class="btn btn-primary btn-small">Send</button>';
            aiChatWindow.appendChild(aiChatInput);
            
            // Create AI assistant button
            aiAssistantButton = document.createElement('button');
            aiAssistantButton.className = 'ai-assistant-button';
            aiAssistantButton.id = 'aiAssistantButton';
            aiAssistantButton.innerHTML = '<span>AI</span>';
            aiContainer.appendChild(aiAssistantButton);
            
            // Add CSS if needed
            if (!document.querySelector('link[href="../css/ai-assistant.css"]')) {
                const aiCssLink = document.createElement('link');
                aiCssLink.rel = 'stylesheet';
                aiCssLink.href = '../css/ai-assistant.css';
                document.head.appendChild(aiCssLink);
            }
        }
        
        // Set up event listeners
        const closeAiChat = document.getElementById('closeAiChat');
        
        // Toggle AI chat window function
        function toggleAiChat() {
            if (aiChatWindow.style.display === 'flex') {
                aiChatWindow.style.display = 'none';
            } else {
                aiChatWindow.style.display = 'flex';
            }
        }
        
        // Add event listeners
        if (aiAssistantButton) {
            aiAssistantButton.addEventListener('click', toggleAiChat);
        }
        
        if (closeAiChat) {
            closeAiChat.addEventListener('click', function() {
                aiChatWindow.style.display = 'none';
            });
        }
        
        // Add event listener to Ask AI button
        askAiBtn.addEventListener('click', toggleAiChat);
        
        // Set up message sending functionality
        const sendAiMessage = document.getElementById('sendAiMessage');
        const aiChatInput = document.getElementById('aiChatInput');
        const aiChatMessages = document.getElementById('aiChatMessages');
        
        if (sendAiMessage && aiChatInput && aiChatMessages) {
            sendAiMessage.addEventListener('click', function() {
                sendMessageToAi();
            });
            
            aiChatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessageToAi();
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
        }
    }
    
    // Rest of the AI assistant code...
    // ... existing code ...
}

// Function to create AI interaction modal
function createAiModal(documentTitle) {
    // Check if modal already exists
    let aiModal = document.getElementById('aiModal');
    if (aiModal) {
        aiModal.style.display = 'flex';
        return;
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'aiModal';
    modal.className = 'ai-modal';
    modal.innerHTML = `
        <div class="ai-modal-content">
            <div class="ai-modal-header">
                <h2>Ask AI Assistant</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="ai-chat-container">
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message">
                        <div class="ai-avatar">AI</div>
                        <div class="ai-message-content">
                            Hello! I'm your AI assistant. How can I help you understand this material?
                        </div>
                    </div>
                </div>
                <div class="ai-input-container">
                    <textarea id="aiMessageInput" placeholder="Type your question here..."></textarea>
                    <button id="aiSendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
        .ai-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .ai-modal-content {
            background-color: var(--card-bg, #fff);
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .ai-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color, #eee);
        }
        
        .ai-modal-header h2 {
            margin: 0;
            font-size: 1.2rem;
            color: var(--text-color, #333);
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-light, #666);
        }
        
        .ai-chat-container {
            display: flex;
            flex-direction: column;
            height: 60vh;
        }
        
        .ai-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        }
        
        .ai-message {
            display: flex;
            margin-bottom: 15px;
        }
        
        .ai-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: var(--primary-color, #4361ee);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
            flex-shrink: 0;
        }
        
        .user-message .ai-avatar {
            background-color: var(--secondary-color, #3f72af);
        }
        
        .ai-message-content {
            background-color: var(--card-bg-light, #f5f7ff);
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 80%;
            color: var(--text-color, #333);
        }
        
        .user-message {
            flex-direction: row-reverse;
        }
        
        .user-message .ai-message-content {
            background-color: var(--primary-color-light, #e6f0ff);
            margin-right: 10px;
            margin-left: 0;
        }
        
        .ai-input-container {
            display: flex;
            padding: 15px;
            border-top: 1px solid var(--border-color, #eee);
        }
        
        #aiMessageInput {
            flex: 1;
            border: 1px solid var(--border-color, #ddd);
            border-radius: 20px;
            padding: 10px 15px;
            font-family: inherit;
            resize: none;
            height: 40px;
            max-height: 120px;
            background-color: var(--input-bg, #f9f9f9);
            color: var(--text-color, #333);
        }
        
        #aiSendBtn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--primary-color, #4361ee);
            color: white;
            border: none;
            margin-left: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #aiSendBtn:hover {
            background-color: var(--primary-color-dark, #3a56d4);
        }
        
        .ai-thinking {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .ai-thinking-dots {
            display: flex;
            margin-left: 10px;
        }
        
        .ai-thinking-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--text-light, #999);
            margin: 0 2px;
            animation: thinking 1.4s infinite ease-in-out both;
        }
        
        .ai-thinking-dot:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .ai-thinking-dot:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes thinking {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners after the modal is created
    setTimeout(() => {
        // Close modal when clicking the close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside the content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Handle sending messages
        const sendBtn = document.getElementById('aiSendBtn');
        const messageInput = document.getElementById('aiMessageInput');
        const chatMessages = document.getElementById('aiChatMessages');
        
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;
            
            // Add user message to chat
            addMessage(message, true);
            messageInput.value = '';
            
            // Get URL parameters for context
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('course_id');
            const materialType = urlParams.get('material_type');
            
            // Call the Gemini API
            fetch('../api/gemini_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    courseId: courseId,
                    materialType: materialType
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Add AI response to chat
                    addMessage(data.response, false);
                } else {
                    // Add error message
                    addMessage("I'm sorry, I couldn't process your request. Please try again later.", false);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Add error message
                addMessage("I'm sorry, there was an error connecting to the AI service. Please try again later.", false);
            });
        }
        
        function addMessage(content, isUser) {
            const messageElement = document.createElement('div');
            messageElement.className = isUser ? 'ai-message user-message' : 'ai-message';
            messageElement.innerHTML = `
                <div class="ai-avatar">${isUser ? 'You' : 'AI'}</div>
                <div class="ai-message-content">${content}</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 0); // This closing parenthesis and argument were missing
    
    // Append modal to body
    document.body.appendChild(modal);
    
    // Show the modal
    modal.style.display = 'flex';
    
    return modal;
}

// Helper function to show errors
function showError(message) {
    const container = document.querySelector('.reader-container') || document.querySelector('.document-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="padding: 20px; text-align: center;">
                <p>${message}</p>
                <button onclick="window.history.back()" class="btn-primary">Go Back</button>
            </div>
        `;
    }
}