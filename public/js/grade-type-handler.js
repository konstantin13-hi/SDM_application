$(document).ready(function() {
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

    $('#assessment-title').text(`Grades for Assessment Form #${assessmentFormId}`);
    const gradesTableContainer = $('#grades-table-container');

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
        let tableHTML = `
            <table class="table table-bordered">
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
        `;

        students.forEach(student => {
            tableHTML += `
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
            `;
        });

        tableHTML += '</tbody></table>';

        gradesTableContainer.html(tableHTML);

        // Attach event listeners for edit buttons
        $('.edit-grade').on('click', function() {
            openEditGradeModal($(this));
        });
    }

    // Open modal for editing grade
    function openEditGradeModal(button) {
        const studentId = button.data('student-id');
        const gradeId = button.data('grade-id');

        $('#studentId').val(studentId);
        $('#gradeId').val(gradeId);
        $('#gradeDate').val('');
        $('#gradeValue').val('');

        const editModal = new bootstrap.Modal($('#editGradeModal')[0]);
        editModal.show();
    }

    // Save updated grade
    $('#save-grade-button').on('click', async function() {
        const gradeId = $('#gradeId').val();
        const gradeDate = $('#gradeDate').val();
        const gradeValue = parseFloat($('#gradeValue').val());
        const studentId = $('#studentId').val();

        // Проверяем, что дата и оценка валидны
        if (!gradeDate || isNaN(gradeValue) || gradeValue < 1 || gradeValue > 5) {
            displayMessage('Please enter a valid date and grade between 1 and 5.', 'danger');
            return;
        }

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
                bootstrap.Modal.getInstance($('#editGradeModal')[0]).hide();
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
        const messageContainer = $('#message-container');
        messageContainer.removeClass('d-none').addClass(`alert alert-${type}`).text(message);

        setTimeout(function() {
            messageContainer.addClass('d-none');
        }, 3000);
    }

    // Initialize
    fetchStudentsAndGrades();
});
