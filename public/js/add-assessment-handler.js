document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    const form = document.getElementById('add-assessment-form');
    const assessmentsList = document.getElementById('assessments-list');

    // Добавление новой формы в DOM
    function addAssessmentToDOM(assessment) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.dataset.id = assessment.id;

        listItem.innerHTML = `
            <input type="text" class="form-type-input" value="${assessment.form_type}" disabled>
            <input type="number" class="weight-input" value="${assessment.weight}" disabled>
            <div>
                <button class="btn btn-warning btn-sm edit-btn">Edit</button>
                <button class="btn btn-success btn-sm save-btn d-none">Save</button>
                <button class="btn btn-danger btn-sm delete-btn">Delete</button>
            </div>
        `;

        assessmentsList.appendChild(listItem);

        const editBtn = listItem.querySelector('.edit-btn');
        const saveBtn = listItem.querySelector('.save-btn');
        const deleteBtn = listItem.querySelector('.delete-btn');
        const formTypeInput = listItem.querySelector('.form-type-input');
        const weightInput = listItem.querySelector('.weight-input');

        editBtn.addEventListener('click', () => {
            formTypeInput.disabled = false;
            weightInput.disabled = false;
            editBtn.classList.add('d-none');
            saveBtn.classList.remove('d-none');
        });

        saveBtn.addEventListener('click', async () => {
            const newType = formTypeInput.value.trim();
            const newWeight = parseFloat(weightInput.value);

            if (!newType || isNaN(newWeight) || newWeight < 1 || newWeight > 100) {
                displayMessage('Please enter valid assessment type and weight (1-100).', 'danger');
                return;
            }

            const totalWeight = await validateTotalWeight(newWeight, assessment.id);
            if (totalWeight + newWeight > 100) {
                displayMessage('Total weight cannot exceed 100%.', 'danger');
                return;
            }

            editAssessment(assessment.id, newType, newWeight);
            formTypeInput.disabled = true;
            weightInput.disabled = true;
            editBtn.classList.remove('d-none');
            saveBtn.classList.add('d-none');
        });

        deleteBtn.addEventListener('click', () => deleteAssessment(assessment.id));
    }

    // Загрузка всех форм оценивания
    function loadAssessments() {
        fetch(`http://localhost:3000/get-assessments?courseId=${courseId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    data.assessments.forEach(assessment => addAssessmentToDOM(assessment));
                } else {
                    displayMessage(data.message || 'Failed to load assessments.', 'danger');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Добавление новой формы
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const assessmentType = document.getElementById('assessmentType').value.trim();
        const assessmentWeight = parseFloat(document.getElementById('assessmentWeight').value);

        if (!assessmentType) {
            displayMessage('Please enter the type of assessment.', 'danger');
            return;
        }

        if (isNaN(assessmentWeight) || assessmentWeight < 1 || assessmentWeight > 100) {
            displayMessage('Please enter a valid weight between 1 and 100.', 'danger');
            return;
        }

        // Проверка текущей суммы весов
        const currentTotalWeight = await validateTotalWeight();
        if (currentTotalWeight + assessmentWeight > 100) {
            displayMessage('Total weight cannot exceed 100%.', 'danger');
            return;
        }

        const payload = {
            courseId: courseId,
            form_type: assessmentType,
            weight: assessmentWeight,
            date: new Date().toISOString().split('T')[0]
        };

        fetch('http://localhost:3000/add-assessment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    displayMessage(data.message, 'success');
                    form.reset();
                    addAssessmentToDOM({ id: data.id, ...payload });
                } else {
                    displayMessage(data.message || 'Failed to add assessment.', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                displayMessage('Failed to add assessment.', 'danger');
            });
    });

    // Валидация суммы весов
    async function validateTotalWeight() {
        const response = await fetch(`http://localhost:3000/get-total-weight?courseId=${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.totalWeight || 0;
    }

    // Редактирование формы
    function editAssessment(id, formType, weight) {
        fetch(`http://localhost:3000/update-assessment/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ form_type: formType, weight })
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    displayMessage('Assessment updated successfully', 'success');
                } else {
                    displayMessage(data.message || 'Failed to update assessment.', 'danger');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Удаление формы
    function deleteAssessment(id) {
        if (confirm('Are you sure you want to delete this assessment?')) {
            fetch(`http://localhost:3000/delete-assessment/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(async response => {
                    const data = await response.json();
                    if (response.ok) {
                        displayMessage('Assessment deleted successfully', 'success');
                        document.querySelector(`li[data-id="${id}"]`).remove();
                    } else {
                        displayMessage(data.message || 'Failed to delete assessment.', 'danger');
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }

    // Функция отображения сообщений
    function displayMessage(message, type) {
        const messageDiv = document.getElementById('message-container');
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        messageDiv.classList.remove('d-none');
        setTimeout(() => messageDiv.classList.add('d-none'), 3000);
    }

    loadAssessments();
});
