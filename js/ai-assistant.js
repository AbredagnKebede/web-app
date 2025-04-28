document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const aiAssistantButton = document.getElementById('aiAssistantButton');
    const aiChatWindow = document.getElementById('aiChatWindow');
    const closeAiChat = document.getElementById('closeAiChat');
    const aiChatInput = document.getElementById('aiChatInput');
    const sendAiMessage = document.getElementById('sendAiMessage');
    const aiChatMessages = document.getElementById('aiChatMessages');
    
    // Load chat history from localStorage
    loadChatHistory();
    
    // Toggle chat window when AI button is clicked
    aiAssistantButton.addEventListener('click', function() {
        aiChatWindow.classList.toggle('active');
        if (aiChatWindow.classList.contains('active')) {
            aiChatInput.focus();
        }
    });
    
    // Close chat window when close button is clicked
    closeAiChat.addEventListener('click', function() {
        aiChatWindow.classList.remove('active');
    });
    
    // Send message when send button is clicked
    sendAiMessage.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed (but allow Shift+Enter for new lines)
    aiChatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Function to send user message and get AI response
    function sendMessage() {
        const userMessage = aiChatInput.value.trim();
        
        if (userMessage === '') return;
        
        // Add user message to chat
        addMessageToChat('user', userMessage);
        
        // Clear input
        aiChatInput.value = '';
        
        // Simulate AI thinking with typing indicator
        addTypingIndicator();
        
        // Simulate AI response after a short delay
        setTimeout(() => {
            removeTypingIndicator();
            const aiResponse = generateAIResponse(userMessage);
            addMessageToChat('ai', aiResponse);
            
            // Save chat history to localStorage
            saveChatHistory();
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }
    
    // Add message to chat window
    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
        
        const messagePara = document.createElement('p');
        messagePara.textContent = message;
        
        messageDiv.appendChild(messagePara);
        aiChatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
    
    // Add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dots.appendChild(dot);
        }
        
        typingDiv.appendChild(dots);
        aiChatMessages.appendChild(typingDiv);
        
        // Scroll to bottom of chat
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Generate AI response based on user message
    function generateAIResponse(userMessage) {
        // Convert user message to lowercase for easier matching
        const lowerMessage = userMessage.toLowerCase();
        
        // Get current page to provide context-aware responses
        const currentPage = window.location.pathname.split('/').pop();
        
        // Common responses for all pages
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! How can I assist you with Sekay today?";
        } else if (lowerMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return "Goodbye! Feel free to ask if you need any help later.";
        } else if (lowerMessage.includes('help')) {
            return "I can help you navigate the platform, find course materials, or answer questions about your courses. What would you like to know?";
        }
        
        // Page-specific responses
        if (currentPage === 'home.html' || currentPage === '') {
            if (lowerMessage.includes('course') || lowerMessage.includes('material')) {
                return "You can access your course materials by clicking the 'Get Course Materials' button on the home page, or by navigating to the semester selection page.";
            } else if (lowerMessage.includes('contact') || lowerMessage.includes('developer')) {
                return "You can contact the developers using the contact form at the bottom of the home page. Just fill in your details and message.";
            } else if (lowerMessage.includes('feedback')) {
                return "We appreciate your feedback! You can submit it using the feedback form at the bottom of the home page.";
            }
        } else if (currentPage === 'courses.html') {
            if (lowerMessage.includes('filter')) {
                return "You can filter courses using the dropdown menu at the top of the courses list. You can choose between All Courses, Core Courses, or Elective Courses.";
            } else if (lowerMessage.includes('search')) {
                return "To search for a specific course, use the search box above the course list. Just type in the course name or code.";
            } else if (lowerMessage.includes('material') || lowerMessage.includes('resource')) {
                return "Click on any course card to view its materials, including references, lecture notes, and past exams.";
            }
        } else if (currentPage === 'semester-selection.html') {
            if (lowerMessage.includes('semester')) {
                return "You can select either First Semester or Second Semester by clicking the 'Select' button under the respective semester card.";
            } else if (lowerMessage.includes('recent') || lowerMessage.includes('activity')) {
                return "Your recent activity is displayed at the bottom of the page, showing the materials you've accessed recently.";
            }
        }
        
        // Default responses if no specific match
        const defaultResponses = [
            "I'm here to help you navigate Sekay. Could you please be more specific about what you need?",
            "I'm not sure I understand. Could you rephrase your question?",
            "As your Sekay assistant, I can help with finding courses, accessing materials, or navigating the platform. What would you like to know?",
            "I'm still learning! Could you ask that in a different way?",
            "That's an interesting question. Let me help you find the information you need about Sekay."
        ];
        
        // Return a random default response
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Save chat history to localStorage
    function saveChatHistory() {
        const messages = aiChatMessages.innerHTML;
        localStorage.setItem('sekayAiChatHistory', messages);
    }
    
    // Load chat history from localStorage
    function loadChatHistory() {
        const savedChat = localStorage.getItem('sekayAiChatHistory');
        if (savedChat) {
            aiChatMessages.innerHTML = savedChat;
            // Scroll to bottom of chat
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }
    }
});

// Allow Enter key to send message
document.getElementById('aiChatInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendAiMessage').click();
    }
});

// Add scroll indicator
window.addEventListener('scroll', function() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scrollIndicator').style.width = scrolled + '%';
});

// Dark mode toggle
document.getElementById('darkModeBtn').addEventListener('click', function() {
    document.body.classList.add('dark-mode');
    this.classList.add('active');
    document.getElementById('lightModeBtn').classList.remove('active');
});

document.getElementById('lightModeBtn').addEventListener('click', function() {
    document.body.classList.remove('dark-mode');
    this.classList.add('active');
    document.getElementById('darkModeBtn').classList.remove('active');
});

// Sample code for the forms (would be expanded in a real application)
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Contact form submitted! This would normally send an email or create a support ticket.');
    this.reset();
});

document.getElementById('feedbackForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your feedback! We appreciate your input.');
    this.reset();
});

// Get username (mock example - would normally come from a login system)
document.addEventListener('DOMContentLoaded', function() {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
        document.getElementById('userName').textContent = storedName;
    }
});
