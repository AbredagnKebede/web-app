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
    // Get reference to material elements
    const referenceLink = document.getElementById('referenceLink');
    const lectureLink = document.getElementById('lectureLink');
    const examLink = document.getElementById('examLink');
    
    const referenceCount = document.getElementById('referenceCount');
    const lectureCount = document.getElementById('lectureCount');
    const examCount = document.getElementById('examCount');
    
    // Update reference materials
    if (materials.reference_link) {
        referenceLink.href = materials.reference_link;
        referenceLink.classList.add('active');
        referenceCount.textContent = 'Available';
    } else {
        referenceLink.href = '#';
        referenceLink.classList.add('disabled');
        referenceLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('No reference materials available for this course');
        });
        referenceCount.textContent = 'Not available';
    }
    
    // Update lecture notes
    if (materials.lecture_note_link) {
        lectureLink.href = materials.lecture_note_link;
        lectureLink.classList.add('active');
        lectureCount.textContent = 'Available';
    } else {
        lectureLink.href = '#';
        lectureLink.classList.add('disabled');
        lectureLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('No lecture notes available for this course');
        });
        lectureCount.textContent = 'Not available';
    }
    
    // Update exam materials
    if (materials.exam_link) {
        examLink.href = materials.exam_link;
        examLink.classList.add('active');
        examCount.textContent = 'Available';
    } else {
        examLink.href = '#';
        examLink.classList.add('disabled');
        examLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('No exam materials available for this course');
        });
        examCount.textContent = 'Not available';
    }
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