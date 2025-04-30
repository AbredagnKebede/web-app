document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const semester = urlParams.get('semester') || '1';
    
    // Update semester text
    const semesterText = semester === '1' ? 'First Semester' : 'Second Semester';
    document.getElementById('currentSemester').textContent = semesterText;
    document.getElementById('currentSemesterText').textContent = `${semesterText} Courses`;

    // Fetch and display user info, then fetch courses
    fetch('../php/get_user_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading user info:', data.message);
                if (data.message === 'User not logged in') {
                    window.location.href = 'login.html';
                }
                return;
            }

            // Display user info
            document.getElementById('academicYear').textContent = data.academic_year;
            document.getElementById('department').textContent = data.department;

            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = data.name;
            }

            // Fetch and display courses
            fetch(`../php/get_courses.php?semester=${semester}`)
                .then(response => response.json())
                .then(courseData => {
                    if (!courseData.error && courseData.courses.length > 0) {
                        displayCourses(courseData.courses);
                    } else {
                        document.getElementById('noCoursesMessage').style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error loading courses:', error);
                    document.getElementById('noCoursesMessage').style.display = 'block';
                });

        })
        .catch(error => {
            console.error('Error fetching user info:', error);
        });

    // Modal close
    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('courseModal').style.display = 'none';
    });

    // Placeholder for future filter/search logic
    document.getElementById('filterCourses').addEventListener('change', function () {
        // Filtering logic goes here
    });

    document.getElementById('searchCourses').addEventListener('input', function () {
        // Searching logic goes here
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
                <h3 style="margin: 0; font-size: 1.2rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${course.name || course.title}
                </h3>
            </div>
            <div class="course-content" style="padding: 15px; flex-grow: 1;">
                <p><strong>Code:</strong> ${course.code}</p>
                <p><strong>Credit Hours:</strong> ${course.credit_hours || 'N/A'}</p>
                <p><strong>Instructor:</strong> ${course.instructor || 'N/A'}</p>
                <p><strong>Type:</strong> ${course.type || 'Regular'}</p>
            </div>
            <div class="course-footer" style="padding: 15px; border-top: 1px solid #edf2f7; text-align: center;">
                <button class="view-materials-btn" style="width: 100%; padding: 8px 16px; background-color: #4361ee; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    View Materials
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}
