

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');



async function fetchFinalGrades() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/grades/course/${courseId}/final-grades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            displayFinalGrades(data.students);
        } else {
            document.getElementById('final-grades-list').innerHTML = `<p class="text-danger">${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching final grades:', error);
        document.getElementById('final-grades-list').innerHTML = `<p class="text-danger">Error fetching final grades.</p>`;
    }
}

function displayFinalGrades(students) {
    const container = document.getElementById('final-grades-list');
    container.innerHTML = students.map(student => `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${student.name} ${student.surname}</h5>
                    <p class="card-text">Final Grade: ${student.final_grade.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
}

fetchFinalGrades();
