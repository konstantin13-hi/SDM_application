// public/js/view-attendance-handler.js

import { loadNavbar } from '../components/Navbar.js';
import { loadModal } from '../components/Modal.js';

$(document).ready(function () {
    loadNavbar();
    loadModal();

    const logoutButton = $('#logoutButton');
    if (logoutButton.length) {
        logoutButton.on('click', function () {
            localStorage.removeItem('token');
            window.location.href = 'loginPage.html';
        });
    }

    // Initialize form elements
    const attendanceDatesList = $('#attendanceDatesList');
    const attendanceRecordsDiv = $('#attendance-records');
    const viewAttendanceResults = $('#view-attendance-results');

    // Function to get query parameters from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Get courseId from URL
    const courseId = getQueryParam('courseId');
    console.log('Course ID:', courseId);
    if (!courseId) {
        viewAttendanceResults.html('<div class="alert alert-danger">No course selected. Please select a course from <a href="coursesPage.html">My Courses</a>.</div>');
        return;
    }

    // Fetch available dates for the course
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
            viewAttendanceResults.html(`<div class="alert alert-danger">Error loading available dates: ${error.message}</div>`);
        }
    }

    // Display available dates as buttons
    function populateDateList(dates) {
        attendanceDatesList.empty();

        if (dates.length === 0) {
            attendanceDatesList.html('<p>No attendance records found for this course.</p>');
            return;
        }

        dates.forEach(date => {
            const listItem = $('<li>').addClass('list-group-item');
            const button = $('<button>').addClass('btn btn-link')
                .attr('type', 'button')
                .data('date', date)
                .text(formatDate(date));

            button.on('click', () => {
                const dateToSend = button.data('date');
                console.log('Fetching attendance for courseId:', courseId, 'date:', dateToSend);
                fetchAttendance(courseId, dateToSend);
            });

            listItem.append(button);
            attendanceDatesList.append(listItem);
        });
    }

    // Format date to a more readable form
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(Date.UTC(year, month - 1, day));
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    // Fetch attendance for the course and date
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
            viewAttendanceResults.html(`<div class="alert alert-danger">Error loading attendance: ${error.message}</div>`);
        }
    }

    // Display attendance records
    function displayAttendance(attendance, date) {
        attendanceRecordsDiv.empty();

        if (attendance.length === 0) {
            attendanceRecordsDiv.html('<p>No attendance records found for this date.</p>');
            return;
        }

        const header = $('<h3>').text(`Attendance for ${formatDate(date)}`);
        attendanceRecordsDiv.append(header);

        const table = $('<table>').addClass('table table-bordered');
        const thead = $('<thead>').html(`
            <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Status</th>
                <th>Edit</th>
            </tr>
        `);
        table.append(thead);

        const tbody = $('<tbody>');
        attendance.forEach(record => {
            const tr = $('<tr>').html(`
                <td>${record.student_id}</td>
                <td>${record.name}</td>
                <td>${record.surname}</td>
                <td>${capitalizeFirstLetter(record.status)}</td>
                <td><button type="button" class="btn btn-sm btn-primary edit-button" data-student-id="${record.student_id}" data-status="${record.status}">Edit</button></td>
            `);
            tbody.append(tr);
        });

        table.append(tbody);
        attendanceRecordsDiv.append(table);

        // Add event listeners for "Edit" buttons
        $('.edit-button').on('click', function () {
            const studentId = $(this).data('student-id');
            const currentStatus = $(this).data('status');
            openEditModal(studentId, currentStatus, date, courseId);
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Open the edit modal
    function openEditModal(studentId, currentStatus, date, courseId) {
        console.log('Opening edit modal with:', { studentId, currentStatus, date, courseId });

        $('#studentId').val(studentId);
        $('#status').val(currentStatus);
        $('#courseId').val(courseId);
        $('#date').val(date);

        const editAttendanceModal = new bootstrap.Modal($('#editAttendanceModal')[0], {
            keyboard: false
        });
        editAttendanceModal.show();
    }

    // Handle "Save Changes" button in the modal
    const saveEditButton = $('#save-edit-button');
    if (saveEditButton.length) {
        saveEditButton.on('click', async function () {
            const courseId = $('#courseId').val();
            const date = $('#date').val();
            const studentId = $('#studentId').val();
            const newStatus = $('#status').val();

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
                const response = await fetch('http://localhost:3000/attendance/update', {
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

                const editAttendanceModalInstance = bootstrap.Modal.getInstance($('#editAttendanceModal')[0]);
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
