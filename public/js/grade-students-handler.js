$(document).ready(function () {
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

    const $assessmentTypesContainer = $('#assessment-types');

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
        $assessmentTypesContainer.empty(); // Очищаем контейнер перед добавлением новых элементов

        if (assessmentForms.length === 0) {
            $assessmentTypesContainer.html('<p>No assessment forms found for this course. Please add assessments first.</p>');
            return;
        }

        $.each(assessmentForms, function (index, form) {
            const $col = $('<div>').addClass('col-md-4 mb-4');
            const $card = $('<div>').addClass('card assessment-card h-100').attr('data-assessment-form-id', form.id);

            $card.html(`
                <div class="card-body">
                    <div class="assessment-icon">
                        <i class="bi bi-clipboard2-data"></i>
                    </div>
                    <h5 class="card-title">${capitalizeFirstLetter(form.form_type)}</h5>
                    <p>Weight: ${form.weight}%</p>
                    <p>Date Created: ${form.date_created}</p>
                </div>
            `);

            // Добавляем обработчик события для перехода к оцениванию студентов
            $card.on('click', function () {
                window.location.href = `gradeType.html?courseId=${courseId}&assessmentFormId=${form.id}`;
            });

            $col.append($card);
            $assessmentTypesContainer.append($col);
        });
    }

    // Функция для отображения сообщений об ошибках
    function displayMessage(message, type) {
        const $messageDiv = $(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);

        $assessmentTypesContainer.prepend($messageDiv);
    }

    // Функция для капитализации первой буквы
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Вызов функции загрузки форм оценивания
    fetchAssessmentForms(courseId);
});
