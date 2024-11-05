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
    console.log('Course ID:', courseId); // Dodany log dla debugowania
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
            console.log('Available Dates:', data.dates); // Dodany log
            populateDateList(data.dates);
        } catch (error) {
            console.error('Error loading available dates:', error);
            viewAttendanceResults.innerHTML = `<div class="alert alert-danger">Error loading available dates: ${error.message}</div>`;
        }
    }

    // Funkcja do wyświetlania listy dat jako przyciski
    function populateDateList(dates) {
        // Czyścimy istniejącą listę dat
        attendanceDatesList.innerHTML = '';

        if (dates.length === 0) {
            attendanceDatesList.innerHTML = '<p>No attendance records found for this course.</p>';
            return;
        }

        // Tworzymy przyciski dla każdej daty
        dates.forEach(date => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';

            const button = document.createElement('button');
            button.className = 'btn btn-link';
            button.type = 'button'; // Ustawienie typu na 'button' zapobiega przesyłaniu formularza

            // Przechowujemy oryginalną datę jako atrybut data-date
            button.setAttribute('data-date', date);

            // Formatujemy datę do bardziej czytelnego formatu bez tworzenia obiektu Date
            const formattedDate = formatDate(date);
            button.textContent = formattedDate;

            button.addEventListener('click', () => {
                const dateToSend = button.getAttribute('data-date'); // Pobieramy oryginalną datę
                console.log('Fetching attendance for courseId:', courseId, 'date:', dateToSend); // Dodany log
                fetchAttendance(courseId, dateToSend);
            });

            listItem.appendChild(button);
            attendanceDatesList.appendChild(listItem);
        });
    }

    // Funkcja do formatowania daty na bardziej czytelną formę bez przekształcania na obiekt Date
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(Date.UTC(year, month - 1, day)); // Tworzymy obiekt Date w UTC
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
            console.log('Attendance Data:', data.attendance); // Dodany log
            displayAttendance(data.attendance, date);
        } catch (error) {
            console.error('Error loading attendance:', error);
            viewAttendanceResults.innerHTML = `<div class="alert alert-danger">Error loading attendance: ${error.message}</div>`;
        }
    }

    // Funkcja do wyświetlania obecności
    function displayAttendance(attendance, date) {
        // Czyścimy istniejącą listę obecności
        attendanceRecordsDiv.innerHTML = '';

        if (attendance.length === 0) {
            attendanceRecordsDiv.innerHTML = '<p>No attendance records found for this date.</p>';
            return;
        }

        // Tworzymy nagłówek z datą
        const header = document.createElement('h3');
        header.textContent = `Attendance for ${formatDate(date)}`;
        attendanceRecordsDiv.appendChild(header);

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

    // Pobranie dostępnych dat po załadowaniu strony
    fetchAvailableDates(courseId);
});
