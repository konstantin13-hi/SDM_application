// public/js/grade-students-handler.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    if (!courseId) {
        displayMessage('No course selected. Please select a course from My Courses.', 'danger');
        return;
    }

    const assessmentTypesContainer = document.getElementById('assessment-types');

    // Funkcja do pobierania unikalnych typów ocen dla danego kursu
    async function fetchAssessmentTypes(courseId) {
        try {
            const response = await fetch(`http://localhost:3000/grades/course/${courseId}/assessment-types`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: You do not own this course.');
                }
                throw new Error('Failed to fetch assessment types.');
            }

            const data = await response.json();
            console.log('Assessment Types:', data.assessmentTypes);
            populateAssessmentTypes(data.assessmentTypes);
        } catch (error) {
            console.error('Error fetching assessment types:', error);
            displayMessage(`Error: ${error.message}`, 'danger');
        }
    }

    // Funkcja do tworzenia kafelków z typami ocen
    function populateAssessmentTypes(assessmentTypes) {
        assessmentTypesContainer.innerHTML = '';

        if (assessmentTypes.length === 0) {
            assessmentTypesContainer.innerHTML = '<p>No assessment types found for this course. Please add assessments first.</p>';
            return;
        }

        assessmentTypes.forEach(type => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';

            const card = document.createElement('div');
            card.className = 'card assessment-card h-100';
            card.setAttribute('data-assessment-type', type.form_type);

            card.innerHTML = `
                <div class="card-body">
                    <div class="assessment-icon">
                        <i class="bi bi-clipboard2-data"></i> <!-- Ikona Bootstrap Icons -->
                    </div>
                    <h5 class="card-title">${capitalizeFirstLetter(type.form_type)}</h5>
                </div>
            `;

            // Dodanie event listenera do kafelka
            card.addEventListener('click', () => {
                window.location.href = `gradeType.html?courseId=${courseId}&assessmentType=${encodeURIComponent(type.form_type)}`;
            });

            col.appendChild(card);
            assessmentTypesContainer.appendChild(col);
        });
    }

    // Funkcja do wyświetlania komunikatów
    function displayMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
        messageDiv.role = 'alert';
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        assessmentTypesContainer.prepend(messageDiv);
    }

    // Funkcja pomocnicza do kapitalizacji pierwszej litery
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Pobranie typów ocen po załadowaniu strony
    fetchAssessmentTypes(courseId);
});
