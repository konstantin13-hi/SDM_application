// public/js/grade-type-handler.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    const assessmentType = urlParams.get('assessmentType');

    if (!courseId || !assessmentType) {
        displayMessage('Missing course ID or assessment type.', 'danger');
        return;
    }

    const assessmentTitle = document.getElementById('assessment-title');
    assessmentTitle.textContent = `Grade Students - ${capitalizeFirstLetter(assessmentType)}`;

    const gradesTableContainer = document.getElementById('grades-table-container');

    // Funkcja do pobierania studentów przypisanych do kursu
    async function fetchStudents(courseId) {
        try {
            const response = await fetch(`http://localhost:3000/grades/course/${courseId}/students`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: You do not own this course.');
                }
                throw new Error('Failed to fetch students.');
            }

            const data = await response.json();
            console.log('Students:', data.students);
            fetchGrades(courseId, assessmentType, data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
            displayMessage(`Error: ${error.message}`, 'danger');
        }
    }

    // Funkcja do pobierania ocen dla każdego studenta
    async function fetchGrades(courseId, assessmentType, students) {
        try {
            const response = await fetch(`http://localhost:3000/grades/course/${courseId}/assessment-type/${encodeURIComponent(assessmentType)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch grades.');
            }

            const data = await response.json();
            const grades = data.grades; // Zakładamy, że backend zwraca oceny
            const gradesMap = {};
            grades.forEach(grade => {
                gradesMap[grade.student_id] = grade;
            });
            createTable(students, gradesMap);
        } catch (error) {
            console.error('Error fetching grades:', error);
            displayMessage(`Error: ${error.message}`, 'danger');
        }
    }

    // Funkcja do tworzenia tabeli z studentami
    function createTable(students, gradesMap) {
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        table.id = 'grades-table';
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Grade Date</th>
                    <th>Grade</th>
                    <th>Edit Grade</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => {
                    const grade = gradesMap[student.id] || {};
                    return `
                        <tr>
                            <td>${student.id}</td>
                            <td>${student.name}</td>
                            <td>${student.surname}</td>
                            <td>${grade.date || ''}</td>
                            <td>${grade.grade !== null ? grade.grade : ''}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-primary edit-grade-btn" data-student-id="${student.id}" data-grade-id="${grade.id || ''}">
                                    Edit
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;

        gradesTableContainer.innerHTML = '';
        gradesTableContainer.appendChild(table);

        // Dodanie event listenerów do przycisków "Edit"
        document.querySelectorAll('.edit-grade-btn').forEach(button => {
            button.addEventListener('click', () => {
                const studentId = button.getAttribute('data-student-id');
                const gradeId = button.getAttribute('data-grade-id');
                openEditGradeModal(studentId, gradeId);
            });
        });
    }

    // Funkcja do otwierania modalu edycji oceny
    function openEditGradeModal(studentId, gradeId) {
        console.log('Opening edit modal for student ID:', studentId, 'Grade ID:', gradeId);

        // Jeśli gradeId jest puste, oznacza to, że ocena jeszcze nie została wystawiona
        if (!gradeId) {
            document.getElementById('studentId').value = studentId;
            document.getElementById('gradeDate').value = '';
            document.getElementById('gradeValue').value = '';
            document.getElementById('gradeId').value = '';
            const editGradeModal = new bootstrap.Modal(document.getElementById('editGradeModal'), {
                keyboard: false
            });
            editGradeModal.show();
            return;
        }

        // Pobranie oceny dla danego studenta
        fetch(`http://localhost:3000/grades/student/${studentId}/course/${courseId}/assessment-type/${encodeURIComponent(assessmentType)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const grade = data.grade;
            document.getElementById('studentId').value = studentId;
            document.getElementById('gradeDate').value = grade.date || '';
            document.getElementById('gradeValue').value = grade.grade !== null ? grade.grade : '';
            document.getElementById('gradeId').value = grade.id || '';
            const editGradeModal = new bootstrap.Modal(document.getElementById('editGradeModal'), {
                keyboard: false
            });
            editGradeModal.show();
        })
        .catch(error => {
            console.error('Error fetching grade:', error);
            displayMessage(`Error: ${error.message}`, 'danger');
        });
    }

    // Obsługa przycisku "Save Changes" w modalu
    const saveGradeButton = document.getElementById('save-grade-button');
    if (saveGradeButton) {
        saveGradeButton.addEventListener('click', async () => {
            const gradeId = document.getElementById('gradeId').value;
            const gradeDate = document.getElementById('gradeDate').value;
            const gradeValue = parseFloat(document.getElementById('gradeValue').value);
            const studentId = document.getElementById('studentId').value;

            // Walidacja danych
            if (!gradeDate || isNaN(gradeValue) || gradeValue < 1 || gradeValue > 100) {
                displayMessage('Please enter a valid date and grade between 1 and 100.', 'danger');
                return;
            }

            const payload = {
                gradeId: gradeId,
                gradeDate: gradeDate,
                gradeValue: gradeValue
            };

            try {
                const response = await fetch('http://localhost:3000/grades/update-grade', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (response.ok) {
                    showToast(data.message, true);
                    // Zamknięcie modalu
                    const editGradeModalInstance = bootstrap.Modal.getInstance(document.getElementById('editGradeModal'));
                    editGradeModalInstance.hide();
                    // Odświeżenie tabeli
                    fetchStudents(courseId);
                } else {
                    showToast(data.message || 'Failed to update grade.', false);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to update grade.', false);
            }
        });
    }

    // Funkcja do wyświetlania Toastów
    function showToast(message, isSuccess = true) {
        const toastElement = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastBody');
        toastBody.textContent = message;
        if (isSuccess) {
            toastElement.classList.remove('text-bg-danger');
            toastElement.classList.add('text-bg-success');
        } else {
            toastElement.classList.remove('text-bg-success');
            toastElement.classList.add('text-bg-danger');
        }
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    // Funkcja do wyświetlania komunikatów
    function displayMessage(message, type) {
        const messageDiv = document.getElementById('message-container');
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        messageDiv.classList.remove('d-none'); // Pokazanie komunikatu

        setTimeout(() => {
            messageDiv.classList.add('d-none'); // Ukrycie komunikatu po 3 sekundach
        }, 3000);
    }

    // Funkcja pomocnicza do kapitalizacji pierwszej litery
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Pobranie studentów i ocen po załadowaniu strony
    fetchStudents(courseId);
});
