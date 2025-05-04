document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    const courseName = urlParams.get('course_name');
    const semester = urlParams.get('semester');
    const department = urlParams.get('department');
    
    // Update breadcrumb and course title
    document.getElementById('courseTitle').textContent = courseName || 'Course Title';
    document.getElementById('courseCrumb').textContent = courseName || 'Course Name';
    document.getElementById('coursesLink').href = `courses.html?semester=${semester}`;
    
    // If course ID is available, fetch course materials
    if (courseId) {
        fetchCourseMaterials(courseId);
    } else {
        console.error('No course ID provided');
        showError('Course information not found. Please go back and try again.');
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear session and redirect to login
            fetch('../api/logout.php')
                .then(response => response.json())
                .then(data => {
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    console.error('Error logging out:', error);
                });
        });
    }
});

function fetchCourseMaterials(courseId) {
    // Fetch user's materials for this course
    fetch(`../php/get_materials.php?course_id=${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                displayMaterials(data.materials);
            } else {
                console.error('Error fetching materials:', data.message);
                showError(data.message || 'Failed to load course materials');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to load course materials. Please try again later.');
        });
}

function displayMaterials(materials) {
    // Update reference link
    const referenceLink = document.getElementById('referenceLink');
    if (materials.reference_link) {
        // Redirect to reader page instead of opening in new tab
        referenceLink.href = `reader.html?course_id=${getUrlParam('course_id')}&course_name=${encodeURIComponent(getUrlParam('course_name'))}&material_type=reference&material_url=${encodeURIComponent(materials.reference_link)}`;
        referenceLink.target = ""; // Remove target="_blank"
        referenceLink.rel = ""; // Remove rel attribute
        document.getElementById('referenceCount').textContent = '1 Available';
    } else {
        referenceLink.href = '#';
        referenceLink.onclick = function(e) {
            e.preventDefault();
            alert('No reference materials available for this course');
        };
        document.getElementById('referenceCount').textContent = 'None';
    }
    
    // Update lecture notes link
    const lectureLink = document.getElementById('lectureLink');
    if (materials.lecture_note_link) {
        // Redirect to reader page instead of opening in new tab
        lectureLink.href = `reader.html?course_id=${getUrlParam('course_id')}&course_name=${encodeURIComponent(getUrlParam('course_name'))}&material_type=lecture&material_url=${encodeURIComponent(materials.lecture_note_link)}`;
        lectureLink.target = ""; // Remove target="_blank"
        lectureLink.rel = ""; // Remove rel attribute
        document.getElementById('lectureCount').textContent = '1 Available';
    } else {
        lectureLink.href = '#';
        lectureLink.onclick = function(e) {
            e.preventDefault();
            alert('No lecture notes available for this course');
        };
        document.getElementById('lectureCount').textContent = 'None';
    }
    
    // Update exam link
    const examLink = document.getElementById('examLink');
    if (materials.exam_link) {
        // Redirect to reader page instead of opening in new tab
        examLink.href = `reader.html?course_id=${getUrlParam('course_id')}&course_name=${encodeURIComponent(getUrlParam('course_name'))}&material_type=exam&material_url=${encodeURIComponent(materials.exam_link)}`;
        examLink.target = ""; // Remove target="_blank"
        examLink.rel = ""; // Remove rel attribute
        document.getElementById('examCount').textContent = '1 Available';
    } else {
        examLink.href = '#';
        examLink.onclick = function(e) {
            e.preventDefault();
            alert('No exam materials available for this course');
        };
        document.getElementById('examCount').textContent = 'None';
    }
}

// Add this helper function to get URL parameters
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function showError(message) {
    // Display error message to user
    const container = document.querySelector('.material-cards');
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="window.history.back()" class="btn-primary">Go Back</button>
        </div>
    `;
}