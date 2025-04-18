document.addEventListener('DOMContentLoaded', function() {
    // Load departments for signup page
    const departmentSelect = document.getElementById('department');
    if (departmentSelect) {
        fetch('../api/get_departments.php') 
            .then(response => response.json())
            .then(data => {
                data.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.name;
                    option.textContent = dept.name;
                    departmentSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading departments:', error));
    }

    // Password validation for signup
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm_password');
    
    if (passwordField && confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            if (passwordField.value !== confirmPasswordField.value) {
                confirmPasswordField.setCustomValidity('Passwords do not match');
                document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            } else {
                confirmPasswordField.setCustomValidity('');
                document.getElementById('confirmPasswordError').textContent = '';
            }
        });
        
        passwordField.addEventListener('input', function() {
            if (passwordField.value.length < 6) {
                document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            } else {
                document.getElementById('passwordError').textContent = '';
            }
            
            if (confirmPasswordField.value !== '' && passwordField.value !== confirmPasswordField.value) {
                confirmPasswordField.setCustomValidity('Passwords do not match');
                document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            } else if (confirmPasswordField.value !== '') {
                confirmPasswordField.setCustomValidity('');
                document.getElementById('confirmPasswordError').textContent = '';
            }
        });
    }

    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(signupForm);
            
            fetch('../api/signup_process.php', { // Updated path
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const messageDiv = document.getElementById('message');
                
                if (data.success) {
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'message success';
                    signupForm.reset();
                    
                    // Redirect to login page after successful signup
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'message error';
                    
                    // Display specific field errors
                    if (data.errors) {
                        Object.keys(data.errors).forEach(field => {
                            const errorElement = document.getElementById(field + 'Error');
                            if (errorElement) {
                                errorElement.textContent = data.errors[field];
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('message').textContent = 'An error occurred. Please try again.';
                document.getElementById('message').className = 'message error';
            });
        });
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            
            fetch('../api/login_process.php', { // Updated path
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const messageDiv = document.getElementById('message');
                
                if (data.success) {
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'message success';
                    
                    // Redirect to home page after successful login
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1000);
                } else {
                    messageDiv.textContent = data.message;
                    messageDiv.className = 'message error';
                    
                    // Display specific field errors
                    if (data.errors) {
                        Object.keys(data.errors).forEach(field => {
                            const errorElement = document.getElementById(field + 'Error');
                            if (errorElement) {
                                errorElement.textContent = data.errors[field];
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('message').textContent = 'An error occurred. Please try again.';
                document.getElementById('message').className = 'message error';
            });
        });
    }
});