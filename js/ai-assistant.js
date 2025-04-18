// Basic functionality for the AI Assistant
document.getElementById('aiAssistantButton').addEventListener('click', function() {
    document.getElementById('aiChatWindow').classList.toggle('active');
});

document.getElementById('closeAiChat').addEventListener('click', function() {
    document.getElementById('aiChatWindow').classList.remove('active');
});

document.getElementById('sendAiMessage').addEventListener('click', function() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (message) {
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'user-message';
        userMessageDiv.innerHTML = `<p>${message}</p>`;
        document.getElementById('aiChatMessages').appendChild(userMessageDiv);
        
        // Clear input
        input.value = '';
        
        // Mock AI response (in a real app, this would be an API call)
        setTimeout(() => {
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'ai-message';
            aiMessageDiv.innerHTML = `<p>I'm sorry, I'm just a demo. In the complete version, I would help you with course materials, study tips, and more!</p>`;
            document.getElementById('aiChatMessages').appendChild(aiMessageDiv);
            
            // Scroll to bottom
            const messagesContainer = document.getElementById('aiChatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
        
        // Scroll to bottom
        const messagesContainer = document.getElementById('aiChatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
