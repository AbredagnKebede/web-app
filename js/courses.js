fetch("../api/courses.php") // Corrected path
    .then(response => response.json())
    .then(data => {
        const courseContainer = document.getElementById("courses");

        if (data.error) {
            courseContainer.innerHTML = `<p>${data.error}</p>`;
            return;
        }

        const courses = data.courses;

        if (courses.length === 0) {
            courseContainer.innerHTML = "<p>No courses found for your academic year and department.</p>";
        } else {
            courses.forEach(course => {
                const div = document.createElement("div");
                div.className = "course-card";
                div.innerHTML = `
                    <h2>${course.title} (${course.code})</h2>
                    <p>Semester: ${course.semester} | Academic Year: ${course.academic_year}</p>
                    <a href="materials.html?course_code=${encodeURIComponent(course.code)}">View Materials</a>
                `;
                courseContainer.appendChild(div);
            });
        }
    })
    .catch(err => {
        document.getElementById("courses").innerHTML = "<p>Error loading courses.</p>";
        console.error(err);
    });
