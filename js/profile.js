document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile page
    loadUserProfile();
});

/**
 * Load user profile data from the server
 */
async function loadUserProfile() {
    try {
        // Fetch user profile data
        const response = await fetch('../api/get_profile.php');
        const data = await response.json();
        
        if (data.success) {
            // Display user data on the page
            displayUserProfile(data.user);
        } else {
            // Handle error
            console.error('Failed to load profile:', data.message);
            
            // If not authenticated, redirect to login
            if (data.message === 'Not authenticated') {
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Display user profile data on the page
 * @param {Object} user - User data object
 */
function displayUserProfile(user) {
    // Update profile elements with user data
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = 'Email: ' + user.email;
    document.getElementById('profileDepartment').textContent = 'Department: ' + (user.department_name || 'Not specified');
    document.getElementById('profileYear').textContent = 'Academic Year: ' + user.academic_year;
    
    // Update page title with user name
    document.title = user.name + ' | Profile | Sekay';
}