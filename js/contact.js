document.addEventListener('DOMContentLoaded', function() {
    // Get the feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }

    // Get the contact developer form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

/**
 * Handle feedback form submission
 * @param {Event} event - The form submit event
 */
async function handleFeedbackSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const form = event.target;
    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const feedbackInput = form.querySelector('textarea[name="feedback"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('feedbackMessage') || createMessageElement(form);
    
    // Validate form
    if (!feedbackInput || !feedbackInput.value.trim()) {
        showMessage(messageDiv, 'Please enter your feedback', 'error');
        return;
    }
    
    // Disable submit button and show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
    }
    
    try {
        // Prepare data for API
        const data = {
            name: nameInput ? nameInput.value : 'Anonymous',
            email: emailInput ? emailInput.value : '',
            feedback: feedbackInput.value
        };
        
        // Send data to API
        const response = await fetch('../api/send_feedback.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showMessage(messageDiv, result.message, 'success');
            // Reset form
            form.reset();
        } else {
            // Show error message
            showMessage(messageDiv, result.message || 'Failed to send feedback', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again later.', 'error');
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Feedback';
        }
    }
}

/**
 * Handle contact developer form submission
 * @param {Event} event - The form submit event
 */
async function handleContactSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const form = event.target;
    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const subjectInput = form.querySelector('input[name="subject"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('contactMessage') || createMessageElement(form);
    
    // Validate form
    if (!messageInput || !messageInput.value.trim()) {
        showMessage(messageDiv, 'Please enter your message', 'error');
        return;
    }
    
    // Disable submit button and show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
    }
    
    try {
        // Prepare data for API
        const data = {
            name: nameInput ? nameInput.value : 'Anonymous',
            email: emailInput ? emailInput.value : '',
            subject: subjectInput ? subjectInput.value : 'Contact from Website',
            message: messageInput.value
        };
        
        // Send data to API
        const response = await fetch('../api/contact_developer.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showMessage(messageDiv, result.message, 'success');
            // Reset form
            form.reset();
        } else {
            // Show error message
            showMessage(messageDiv, result.message || 'Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again later.', 'error');
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Message';
        }
    }
}

/**
 * Create a message element to display form submission results
 * @param {HTMLElement} form - The form element
 * @returns {HTMLElement} The created message element
 */
function createMessageElement(form) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.id = form.id === 'feedbackForm' ? 'feedbackMessage' : 'contactMessage';
    form.parentNode.insertBefore(messageDiv, form);
    return messageDiv;
}

/**
 * Show a message to the user
 * @param {HTMLElement} element - The element to show the message in
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success or error)
 */
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Hide message after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}