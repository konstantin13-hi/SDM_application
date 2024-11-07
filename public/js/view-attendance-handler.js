// public/js/view-attendance-handler.js

import { loadNavbar } from '../components/Navbar.js';
import { loadModal } from '../components/Modal.js';

document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    loadModal();

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = 'loginPage.html';
        });
    }

    // Inicjalizacja elementów formularza
    const attendanceDatesList = document.getElementById('attendanceDatesList');
    const attendanceRecordsDiv = document.getElementById('attendance-records');
    const viewAttendanceResults = document.getElementById('view-attendance-results');

    // Funkcja do pobierania parametrów z URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Pobranie courseId z URL
    const courseId = getQueryParam('courseId');
    console.log('Course ID:', courseId); 
    if (!courseId) {
        viewAttendanceResults.innerHTML = `<div class="alert alert-danger">No course selected. Please select a course from <a href="coursesPage.html">My Courses</a>.</div>`;
        return;
    }

    // Funkcja do pobierania dostępnych dat dla kursu
    async function fetchAvailableDates(courseId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/attendance/course/${courseId}/dates`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: You do not own this course.');
                }
                throw new Error('Failed to fetch available dates');
            }
            const data = await response.json();
            console.log('Available Dates:', data.dates); 
            populateDateList(data.dates);
        } catch (error) {
            console.error('Error loading available dates:', error);
            viewAttendanceResults.innerHTML = `<div class="alert alert-danger">Error loading available dates: ${error.message}</div>`;
        }
    }

    // Funkcja do wyświetlania listy dat jako przyciski
    function populateDateList(dates) {
        attendanceDatesList.innerHTML = '';

        if (dates.length === 0) {
            attendanceDatesList.innerHTML = '<p>No attendance records found for this course.</p>';
            return;
        }


        dates.forEach(date => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';

            const button = document.createElement('button');
            button.className = 'btn btn-link';
            button.type = 'button'; 
            button.setAttribute('data-date', date);
            const formattedDate = formatDate(date);
            button.textContent = formattedDate;

            button.addEventListener('click', () => {
                const dateToSend = button.getAttribute('data-date'); 
                console.log('Fetching attendance for courseId:', courseId, 'date:', dateToSend); 
                fetchAttendance(courseId, dateToSend);
            });

            listItem.appendChild(button);
            attendanceDatesList.appendChild(listItem);
        });
    }

    // Funkcja do formatowania daty na bardziej czytelną formę bez przekształcania na obiekt Date
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(Date.UTC(year, month - 1, day)); 
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    // Funkcja do pobierania obecności dla kursu i daty
    async function fetchAttendance(courseId, date) {
        try {
            const token = localStorage.getItem('token');
            console.log(`Sending request to fetch attendance for courseId: ${courseId}, date: ${date}`);
            const response = await fetch(`http://localhost:3000/attendance/course/${courseId}/date/${date}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: You do not own this course.');
                }
                throw new Error('Failed to fetch attendance');
            }
            const data = await response.json();
            console.log('Attendance Data:', data.attendance);
            displayAttendance(data.attendance, date);
        } catch (error) {
            console.error('Error loading attendance:', error);
            viewAttendanceResults.innerHTML = `<div class="alert alert-danger">Error loading attendance: ${error.message}</div>`;
        }
    }

    // Funkcja do wyświetlania obecności
    function displayAttendance(attendance, date) {
        attendanceRecordsDiv.innerHTML = '';

        if (attendance.length === 0) {
            attendanceRecordsDiv.innerHTML = '<p>No attendance records found for this date.</p>';
            return;
        }

        const header = document.createElement('h3');
        header.textContent = `Attendance for ${formatDate(date)}`;
        attendanceRecordsDiv.appendChild(header);

        const table = document.createElement('table');
        table.className = 'table table-bordered';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Status</th>
                <th>Edit</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        attendance.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.student_id}</td>
                <td>${record.name}</td>
                <td>${record.surname}</td>
                <td>${capitalizeFirstLetter(record.status)}</td>
                <td><button type="button" class="btn btn-sm btn-primary edit-button" data-student-id="${record.student_id}" data-status="${record.status}">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        attendanceRecordsDiv.appendChild(table);

        // Dodanie obsługi przycisków "Edit"
        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const studentId = button.getAttribute('data-student-id');
                const currentStatus = button.getAttribute('data-status');
                openEditModal(studentId, currentStatus, date, courseId);
            });
        });
    }


    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Funkcja do otwierania modalu edycji
    function openEditModal(studentId, currentStatus, date, courseId) {
        console.log('Opening edit modal with:', { studentId, currentStatus, date, courseId });

        document.getElementById('studentId').value = studentId;
        document.getElementById('status').value = currentStatus;
        document.getElementById('courseId').value = courseId;
        document.getElementById('date').value = date;

        const editAttendanceModal = new bootstrap.Modal(document.getElementById('editAttendanceModal'), {
            keyboard: false
        });
        editAttendanceModal.show();
    }

    // Obsługa przycisku "Save Changes" w modalu
    const saveEditButton = document.getElementById('save-edit-button');
    if (saveEditButton) {
        saveEditButton.addEventListener('click', async () => {
            const courseId = document.getElementById('courseId').value;
            const date = document.getElementById('date').value;
            const studentId = document.getElementById('studentId').value;
            const newStatus = document.getElementById('status').value;

            const updatedData = {
                courseId: courseId,
                date: date,
                studentId: studentId,
                newStatus: newStatus
            };

            try {
                const validStatuses = ['present', 'absent', 'late', 'excused'];
                if (!validStatuses.includes(newStatus.toLowerCase())) {
                    throw new Error('Invalid status selected.');
                }

                const token = localStorage.getItem('token');
                console.log('Sending update request:', updatedData);
                const response = await fetch(`http://localhost:3000/attendance/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error('Forbidden: You do not own this course.');
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update attendance');
                }

                const result = await response.json();
                console.log('Update Result:', result);

                const editAttendanceModalInstance = bootstrap.Modal.getInstance(document.getElementById('editAttendanceModal'));
                editAttendanceModalInstance.hide();

                alert(result.message);

                fetchAttendance(courseId, date);
            } catch (error) {
                console.error('Error updating attendance:', error);
                alert(`Error updating attendance: ${error.message}`);
            }
        });
    } else {
        console.error('Save Edit Button not found.');
    }

    fetchAvailableDates(courseId);
});
