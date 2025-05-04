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

document.addEventListener('DOMContentLoaded', function() {
    const params = getUrlParams();
    const courseId = params.course_id;
    const courseName = params.course_name;
    
    // Update breadcrumb and course title
    document.getElementById('courseCrumb').textContent = courseName;
    document.getElementById('courseTitle').textContent = courseName;
    document.getElementById('courseCode').textContent = `Course ID: ${courseId}`;
    
    // Set up course link
    document.getElementById('coursesLink').href = 'courses.html';
    
    // Fetch course materials from the database
    if (courseId) {
        fetchCourseMaterials(courseId);
    } else {
        console.error('No course ID provided');
        showError('Course information not found. Please go back and try again.');
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
                displayMaterials(data.materials, courseId);
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

function displayMaterials(materials, courseId) {
    const courseName = getUrlParams().course_name;
    
    // Update reference link
    const referenceLink = document.getElementById('referenceLink');
    if (materials.reference_link) {
        // Redirect to reader page with the material URL
        referenceLink.href = `reader.html?course_id=${courseId}&course_name=${encodeURIComponent(courseName)}&material_type=reference&material_url=${encodeURIComponent(materials.reference_link)}`;
        referenceLink.removeAttribute('target'); // Remove target="_blank"
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
        // Redirect to reader page with the material URL
        lectureLink.href = `reader.html?course_id=${courseId}&course_name=${encodeURIComponent(courseName)}&material_type=lecture&material_url=${encodeURIComponent(materials.lecture_note_link)}`;
        lectureLink.removeAttribute('target'); // Remove target="_blank"
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
        // Redirect to reader page with the material URL
        examLink.href = `reader.html?course_id=${courseId}&course_name=${encodeURIComponent(courseName)}&material_type=exam&material_url=${encodeURIComponent(materials.exam_link)}`;
        examLink.removeAttribute('target'); // Remove target="_blank"
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