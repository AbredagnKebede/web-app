document.addEventListener('DOMContentLoaded', function() {
    // Get semester from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const semester = urlParams.get('semester');
    
    if (semester) {
        document.getElementById('currentSemester').textContent = semester === '1' ? 'First Semester' : 'Second Semester';
        document.getElementById('currentSemesterText').textContent = semester === '1' ? 'First Semester Courses' : 'Second Semester Courses';
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
        card.style.backgroundColor = "#fff";
        card.style.borderRadius = "8px";
        card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        card.style.overflow = "hidden";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.height = "100%";
        
        card.innerHTML = `
            <div class="course-header" style="background-color: #4a5568; color: white; padding: 15px;">
                <h3 style="margin: 0; font-size: 1.2rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${course.name || course.title}</h3>
            </div>
            <div class="course-content" style="padding: 15px; flex-grow: 1;">
                <p style="margin: 8px 0; font-size: 0.9rem; line-height: 1.4;"><strong>Code:</strong> ${course.code}</p>
                <p style="margin: 8px 0; font-size: 0.9rem; line-height: 1.4;"><strong>Credit Hours:</strong> ${course.credit_hours || 'N/A'}</p>
                <p style="margin: 8px 0; font-size: 0.9rem; line-height: 1.4;"><strong>Instructor:</strong> ${course.instructor || 'N/A'}</p>
                <p style="margin: 8px 0; font-size: 0.9rem; line-height: 1.4;"><strong>Type:</strong> ${course.type || 'Regular'}</p>
            </div>
            <div class="course-footer" style="padding: 15px; border-top: 1px solid #edf2f7; text-align: center;">
                <button class="view-materials-btn" style="width: 100%; padding: 8px 16px; background-color: #4361ee; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background-color 0.2s ease;">View Materials</button>
            </div>
        `;
        grid.appendChild(card);
    });
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
