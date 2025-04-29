document.addEventListener('DOMContentLoaded', function() {
    // Get semester from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const semester = urlParams.get('semester');
    
    if (semester) {
        document.getElementById('currentSemester').textContent = semester === '1' ? 'First Semester' : 'Second Semester';
        document.getElementById('currentSemesterText').textContent = semester === '1' ? 'First Semester Courses' : 'Second Semester Courses';
    }
    
    // Update semester display
    const currentSemesterText = document.getElementById('currentSemesterText');
    const currentSemester = document.getElementById('currentSemester');
    if (semester === '1') {
        currentSemesterText.textContent = 'First Semester Courses';
        currentSemester.textContent = 'First Semester';
    } else if (semester === '2') {
        currentSemesterText.textContent = 'Second Semester Courses';
        currentSemester.textContent = 'Second Semester';
    }
    
    // Fetch user info
    fetch('../php/get_user_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('academicYear').textContent = data.academic_year;
                document.getElementById('department').textContent = data.department;
            }
        })
        .catch(error => console.error('Error fetching user info:', error));
    
    // Fetch courses for the selected semester
    const coursesGrid = document.querySelector('.courses-grid');
    
    fetch(`../php/get_courses.php?semester=${semester}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.courses.length > 0) {
                displayCourses(data.courses);
            } else {
                document.getElementById('noCoursesMessage').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('noCoursesMessage').style.display = 'block';
        });
    
    // Close modal when clicking the close button
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('courseModal').style.display = 'none';
    });
    
    // Filter courses functionality
    document.getElementById('filterCourses').addEventListener('change', function() {
        // Add filtering logic here
    });
    
    // Search courses functionality
    document.getElementById('searchCourses').addEventListener('input', function() {
        // Add search logic here
    });
});

function fetchUserCourses() {
    fetch('../api/get_user_courses.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data); // Debug: Log the API response
            if (data.success) {
                displayCourses(data.courses);
            } else {
                document.getElementById('noCoursesMessage').style.display = 'block';
                console.error('Error fetching courses:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            document.getElementById('noCoursesMessage').style.display = 'block';
        });
}

function displayCourses(courses) {
    const grid = document.getElementById("coursesGrid");
    const noMessage = document.getElementById("noCoursesMessage");
    grid.innerHTML = "";

    if (courses.length === 0) {
        noMessage.style.display = "block";
        return;
    }

    noMessage.style.display = "none";

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";
        card.innerHTML = `
            <h3>${course.name || course.title}</h3>
            <p><strong>Code:</strong> ${course.code}</p>
            <p><strong>Credit Hours:</strong> ${course.credit_hours || 'N/A'}</p>
            <p><strong>Instructor:</strong> ${course.instructor || 'N/A'}</p>
            <p><strong>Type:</strong> ${course.type || 'Regular'}</p>
            <button class="btn btn-primary" onclick='openCourseModal(${JSON.stringify(course)})'>View Materials</button>
        `;
        grid.appendChild(card);
    });
}

function openCourseModal(course) {
    document.getElementById("modalCourseName").textContent = course.name || course.title;
    document.getElementById("modalCourseCode").textContent = course.code;
    document.getElementById("modalCreditHours").textContent = course.credit_hours || 'N/A';

    document.getElementById("referencesList").innerHTML = `
        <a href="${course.reference_link || '#'}" target="_blank">Reference Materials</a>
    `;
    document.getElementById("lecturesList").innerHTML = `
        <a href="${course.lecture_note_link || '#'}" target="_blank">Lecture Notes</a>
    `;
    document.getElementById("examsList").innerHTML = `
        <a href="${course.exam_link || '#'}" target="_blank">Past Exams</a>
    `;
    
    // Show modal
    document.getElementById('courseModal').style.display = 'flex';
}


// Function to load user information from session
function loadUserInfo() {
    fetch('../php/get_user_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update user information in the UI
                document.getElementById('academicYear').textContent = data.academic_year;
                document.getElementById('department').textContent = data.department;
                
                // Also update the user name if it exists on the page
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = data.name;
                }
                
                // Get semester from URL parameter or default to 1
                const urlParams = new URLSearchParams(window.location.search);
                const semester = urlParams.get('semester') || '1';
                
                // Update semester information
                document.getElementById('currentSemester').textContent = semester === '1' ? 'First Semester' : 'Second Semester';
                document.getElementById('currentSemesterText').textContent = semester === '1' ? 'First Semester' : 'Second Semester';
            } else {
                // Handle error - redirect to login if user is not logged in
                console.error('Error loading user info:', data.message);
                if (data.message === 'User not logged in') {
                    window.location.href = 'login.html';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
        });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
});
