// public/js/view-attendance-handler.js

import { loadNavbar } from '../components/Navbar.js';
import { loadModal } from '../components/Modal.js';

document.addEventListener("DOMContentLoaded", () => {
    // Ładowanie navbaru i modalu
    loadNavbar();
    loadModal();

    // Obsługa przycisku wylogowania
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = 'loginPage.html';
        });
    }

    // Inicjalizacja elementów formularza
    const attendanceDateView = document.getElementById('attendanceDateView');
    const viewAttendanceForm = document.getElementById('view-attendance-form');
    const attendanceRecordsDiv = document.getElementById('attendance-records');
    const viewAttendanceResults = document.getElementById('view-attendance-results');

    // Funkcja do pobierania parametrów z URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Pobranie courseId z URL
    const courseId = getQueryParam('courseId');
    if (!courseId) {
        viewAttendanceResults.innerHTML = '<div class="alert alert-danger">No course selected. Please select a course from <a href="coursesPage.html">My Courses</a>.</div>';
        viewAttendanceForm.style.display = 'none';
        return;
    }

    // Funkcja do pobierania obecności dla kursu i daty
    async function fetchAttendance(courseId, date) {
        try {
            const token = localStorage.getItem('token');
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
            displayAttendance(data.attendance);
        } catch (error) {
            console.error('Error loading attendance:', error);
            viewAttendanceResults.innerHTML = `<div class="alert alert-danger">Error loading attendance: ${error.message}</div>`;
        }
    }

    // Funkcja do wyświetlania obecności
    function displayAttendance(attendance) {
        // Czyścimy istniejącą listę obecności
        attendanceRecordsDiv.innerHTML = '';

        if (attendance.length === 0) {
            attendanceRecordsDiv.innerHTML = '<p>No attendance records found for this date.</p>';
            return;
        }

        // Tworzymy tabelę z obecnościami
        const table = document.createElement('table');
        table.className = 'table table-bordered';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Status</th>
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
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        attendanceRecordsDiv.appendChild(table);
    }

    // Funkcja pomocnicza do kapitalizacji pierwszej litery
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Obsługa formularza przeglądania obecności
    viewAttendanceForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const date = attendanceDateView.value;

        if (!date) {
            viewAttendanceResults.innerHTML = '<div class="alert alert-warning">Please select a date.</div>';
            return;
        }

        try {
            await fetchAttendance(courseId, date);
            viewAttendanceResults.innerHTML = ''; // Czyścimy poprzednie komunikaty
        } catch (error) {
            console.error('Error:', error);
            viewAttendanceResults.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    });

});
