
import { loadNavbar } from '../components/Navbar.js';
import { loadModal } from '../components/Modal.js';

document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    loadModal();

    const attendanceDateAdd = document.getElementById('attendanceDateAdd');
    const today = new Date().toISOString().split('T')[0];
    attendanceDateAdd.value = today;

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = 'loginPage.html';
        });
    }

    const addAttendanceForm = document.getElementById('add-attendance-form');
    const attendanceRecordsDiv = document.getElementById('attendance-records');
    const addAttendanceResults = document.getElementById('add-attendance-results');

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const courseId = getQueryParam('courseId');
    if (!courseId) {
        addAttendanceResults.innerHTML = `<div class="alert alert-danger">No course selected. Please select a course from <a href="coursesPage.html">My Courses</a>.</div>`;
        addAttendanceForm.style.display = 'none';
        return;
    }

    // Funkcja do pobierania uczniów przypisanych do kursu
    async function fetchStudents(courseId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/courses/${courseId}/students`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: You do not own this course.');
                }
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            populateStudents(data.students);
        } catch (error) {
            console.error('Error loading students:', error);
            addAttendanceResults.innerHTML = `<div class="alert alert-danger">Error loading students: ${error.message}</div>`;
            addAttendanceForm.style.display = 'none';
        }
    }

    // Funkcja do wyświetlania listy uczniów z opcjami obecności
    function populateStudents(students) {
        attendanceRecordsDiv.innerHTML = '';

        if (students.length === 0) {
            attendanceRecordsDiv.innerHTML = '<p>No students found for this course.</p>';
            return;
        }

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const listGroup = document.createElement('div');
        listGroup.className = 'list-group';

        students.forEach(student => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check';

            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input student-checkbox';
            checkbox.type = 'checkbox';
            checkbox.value = student.id;
            checkbox.id = `student-${student.id}`;

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `student-${student.id}`;
            label.textContent = `${student.name} ${student.surname} (ID: ${student.id})`;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);

            const statusSelect = document.createElement('select');
            statusSelect.className = 'form-select status-select w-auto';
            statusSelect.required = false; 

            statusSelect.innerHTML = `
                <option value="" disabled selected>Select status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
            `;

            statusSelect.disabled = true;


            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    statusSelect.disabled = false;
                    statusSelect.required = true;
                } else {
                    statusSelect.disabled = true;
                    statusSelect.required = false;
                    statusSelect.value = '';
                }
            });

            listItem.appendChild(checkboxDiv);
            listItem.appendChild(statusSelect);
            listGroup.appendChild(listItem);
        });

        formGroup.appendChild(listGroup);
        attendanceRecordsDiv.appendChild(formGroup);
    }

    fetchStudents(courseId);

    addAttendanceForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const date = attendanceDateAdd.value;

        const records = [];
        const listItems = attendanceRecordsDiv.querySelectorAll('.list-group-item');

        listItems.forEach(item => {
            const checkbox = item.querySelector('.student-checkbox');
            if (checkbox.checked) {
                const studentId = checkbox.value;
                const status = item.querySelector('.status-select').value;
                if (studentId && status) {
                    records.push({ studentId, status });
                }
            }
        });

        if (!date || records.length === 0) {
            addAttendanceResults.innerHTML = '<div class="alert alert-warning">Please select a date and ensure at least one student is selected with a status.</div>';
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/attendance/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId,
                    date,
                    attendanceRecords: records
                })
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            const data = await response.json();
            if (response.ok) {
                let message = `<div class="alert alert-success">${data.message}</div>`;

                if (data.addedRecords.length > 0) {
                    message += `<div class="alert alert-success">Added attendance for ${data.addedRecords.length} student(s).</div>`;
                }

                if (data.skippedRecords.length > 0) {
                    const skippedIds = data.skippedRecords.map(record => record.studentId);
                    message += `<div class="alert alert-warning">Attendance already exists for student ID(s): ${skippedIds.join(', ')}.</div>`;
                }

                addAttendanceResults.innerHTML = message;
                addAttendanceForm.reset();
                attendanceRecordsDiv.innerHTML = '';
                attendanceDateAdd.value = today;
                fetchStudents(courseId);
            } else {
                addAttendanceResults.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            addAttendanceResults.innerHTML = `<div class="alert alert-danger">Error submitting attendance: ${error.message}</div>`;
        }
    });

});
