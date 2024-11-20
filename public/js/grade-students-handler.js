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

    // Функция для получения форм оценивания для курса
    async function fetchAssessmentForms(courseId) {
        try {
            const response = await fetch(`http://localhost:3000/course/${courseId}/assessment-types`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: You do not own this course.');
                }
                throw new Error('Failed to fetch assessment forms.');
            }

            const data = await response.json();
            console.log('Assessment Forms:', data.assessmentTypes);
            populateAssessmentForms(data.assessmentTypes);
        } catch (error) {
            console.error('Error fetching assessment forms:', error);
            displayMessage(`Error: ${error.message}`, 'danger');
        }
    }

    // Функция для отображения форм оценивания в интерфейсе
    function populateAssessmentForms(assessmentForms) {
        assessmentTypesContainer.innerHTML = '';

        if (assessmentForms.length === 0) {
            assessmentTypesContainer.innerHTML = '<p>No assessment forms found for this course. Please add assessments first.</p>';
            return;
        }

        assessmentForms.forEach(form => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';

            const card = document.createElement('div');
            card.className = 'card assessment-card h-100';
            card.setAttribute('data-assessment-form-id', form.id);

            card.innerHTML = `
                <div class="card-body">
                    <div class="assessment-icon">
                        <i class="bi bi-clipboard2-data"></i>
                    </div>
                    <h5 class="card-title">${capitalizeFirstLetter(form.form_type)}</h5>
                    <p>Weight: ${form.weight}%</p>
                    <p>Date Created: ${form.date_created}</p>
                </div>
            `;

            // Добавляем обработчик события для перехода к оцениванию студентов
            card.addEventListener('click', () => {
                window.location.href = `gradeType.html?courseId=${courseId}&assessmentFormId=${form.id}`;
            });

            col.appendChild(card);
            assessmentTypesContainer.appendChild(col);
        });
    }

    // Функция для отображения сообщений об ошибках
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

    // Функция для капитализации первой буквы
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Вызов функции загрузки форм оценивания
    fetchAssessmentForms(courseId);
});
