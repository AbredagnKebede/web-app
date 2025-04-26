document.addEventListener('DOMContentLoaded', function() {
    // Get semester from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const semester = urlParams.get('semester');
    
    if (semester) {
        document.getElementById('currentSemester').textContent = semester === '1' ? 'First Semester' : 'Second Semester';
        document.getElementById('currentSemesterText').textContent = semester === '1' ? 'First Semester Courses' : 'Second Semester Courses';
    }
    
    // Fetch user courses
    fetchUserCourses();
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
    document.getElementById("modalCourseName").textContent = course.name;
    document.getElementById("modalCourseCode").textContent = course.code;
    document.getElementById("modalCreditHours").textContent = course.credit_hours;
    document.getElementById("modalInstructor").textContent = course.instructor;

    document.getElementById("referencesList").innerHTML = `
        <a href="${course.reference_link}" target="_blank">Reference Materials</a>
    `;
    document.getElementById("lecturesList").innerHTML = `
        <a href="${course.lecture_note_link}" target="_blank">Lecture Notes</a>
    `;
    document.getElementById("examsList").innerHTML = `
        <a href="${course.exam_link}" target="_blank">Past Exams</a>
    `;

    document.getElementById("courseModal").style.display = "block";
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("courseModal").style.display = "none";
});
