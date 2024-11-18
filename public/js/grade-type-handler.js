document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    const assessmentFormId = urlParams.get('assessmentFormId');

    if (!courseId || !assessmentFormId) {
        displayMessage('Missing course ID or assessment form ID.', 'danger');
        return;
    }

    const assessmentTitle = document.getElementById('assessment-title');
    assessmentTitle.textContent = `Grades for Assessment Form #${assessmentFormId}`;

    const gradesTableContainer = document.getElementById('grades-table-container');

    // Fetch students and grades
    async function fetchStudentsAndGrades() {
        try {
            const response = await fetch(`http://localhost:3000/grades/course/${courseId}/assessment-form/${assessmentFormId}/students`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch students: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            const { students } = data;
            createTable(students);
        } catch (error) {
            console.error('Error fetching students and grades:', error);
            displayMessage(`Error: ${error.message}`, 'danger');
        }
    }

    // Create table with students and grades
    function createTable(students) {
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Grade Date</th>
                    <th>Grade</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr>
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.surname}</td>
                        <td>${student.date || ''}</td>
                        <td>${student.grade !== null ? student.grade : ''}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-grade" data-student-id="${student.student_id}" data-grade-id="${student.grade_id || ''}">Edit</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        gradesTableContainer.innerHTML = '';
        gradesTableContainer.appendChild(table);

        document.querySelectorAll('.edit-grade').forEach(button => {
            button.addEventListener('click', () => openEditGradeModal(button));
        });
    }

    // Open modal for editing grade
    function openEditGradeModal(button) {
        const studentId = button.getAttribute('data-student-id');
        const gradeId = button.getAttribute('data-grade-id');

        document.getElementById('studentId').value = studentId;
        document.getElementById('gradeId').value = gradeId;
        document.getElementById('gradeDate').value = '';
        document.getElementById('gradeValue').value = '';

        const editModal = new bootstrap.Modal(document.getElementById('editGradeModal'));
        editModal.show();
    }

    // Save updated grade
    document.getElementById('save-grade-button').addEventListener('click', async () => {
        const gradeId = document.getElementById('gradeId').value;
        const gradeDate = document.getElementById('gradeDate').value;
        const gradeValue = parseFloat(document.getElementById('gradeValue').value);
        const studentId = document.getElementById('studentId').value;


        // Проверяем, что дата и оценка валидны
        if (!gradeDate || isNaN(gradeValue) || gradeValue < 1 || gradeValue > 100) {
            displayMessage('Please enter a valid date and grade between 1 and 100.', 'danger');
            return;
        }

        // Создаем данные для запроса
        const gradeData = {
            gradeDate,
            gradeValue,
            studentId,
            assessmentFormId,
            courseId
        };
        console.log(gradeData);

        try {
            let response;
            // Если gradeId существует, обновляем оценку
            if (gradeId) {
                response = await fetch('http://localhost:3000/grades/update-grade', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ gradeId, ...gradeData })
                });
            } else {
                // Если gradeId нет, создаем новую оценку
                response = await fetch('http://localhost:3000/grades/add-grade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(gradeData)
                });
            }

            const data = await response.json();
            if (response.ok) {
                displayMessage(data.message, 'success');
                fetchStudentsAndGrades(); // Обновляем таблицу студентов и оценок
                bootstrap.Modal.getInstance(document.getElementById('editGradeModal')).hide();
            } else {
                displayMessage(data.message || 'Failed to save grade.', 'danger');
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            displayMessage('Failed to save grade.', 'danger');
        }
    });


    // Display message function
    function displayMessage(message, type) {
        const messageContainer = document.getElementById('message-container');
        messageContainer.className = `alert alert-${type}`;
        messageContainer.textContent = message;
        messageContainer.classList.remove('d-none');

        setTimeout(() => {
            messageContainer.classList.add('d-none');
        }, 3000);
    }

    // Initialize
    fetchStudentsAndGrades();
});
