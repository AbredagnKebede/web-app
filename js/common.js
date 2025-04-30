document.addEventListener('DOMContentLoaded', function() {
    // Handle logout button click
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Call the logout API
            fetch('../api/logout.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Redirect to login page after successful logout
                        window.location.href = 'login.html';
                    } else {
                        console.error('Logout failed:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                });
        });
    }
    
    // Add dark mode toggle functionality
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
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeBtn.classList.add('active');
            lightModeBtn.classList.remove('active');
        }
    }
});