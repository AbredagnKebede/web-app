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
    
    // Set up access buttons to open reader page instead of new tab
    const accessButtons = document.querySelectorAll('.btn-access');
    
    accessButtons.forEach(button => {
        // Remove target="_blank" attribute
        button.removeAttribute('target');
        
        // Add click event listener
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get material type from parent card
            const materialCard = this.closest('.material-card');
            const materialType = materialCard.getAttribute('data-type');
            
            // Get the original URL (assuming it's set in the href)
            const materialUrl = this.getAttribute('href');
            
            // Redirect to reader page with parameters
            window.location.href = `reader.html?course_id=${courseId}&course_name=${encodeURIComponent(courseName)}&material_type=${materialType}&material_url=${encodeURIComponent(materialUrl)}`;
        });
    });
    
    // Simulate loading material counts (replace with actual data fetching)
    document.getElementById('referenceCount').textContent = '5 References';
    document.getElementById('lectureCount').textContent = '12 Lecture Notes';
    
    // Set example links (replace with actual data)
    document.getElementById('referenceLink').href = 'path/to/references.pdf';
    document.getElementById('lectureLink').href = 'path/to/lectures.pdf';
});