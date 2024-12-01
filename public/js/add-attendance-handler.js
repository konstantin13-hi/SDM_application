import { loadNavbar } from '../components/Navbar.js';
import { loadModal } from '../components/Modal.js';

$(document).ready(() => {
    loadNavbar();
    loadModal();

    const today = new Date().toISOString().split('T')[0];
    $('#attendanceDateAdd').val(today);

    $('#logoutButton').on('click', function () {
        localStorage.removeItem('token');
        window.location.href = 'loginPage.html';
    });

    const $addAttendanceForm = $('#add-attendance-form');
    const $attendanceRecordsDiv = $('#attendance-records');
    const $addAttendanceResults = $('#add-attendance-results');

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const courseId = getQueryParam('courseId');
    if (!courseId) {
        $addAttendanceResults.html(
            `<div class="alert alert-danger">No course selected. Please select a course from <a href="coursesPage.html">My Courses</a>.</div>`
        );
        $addAttendanceForm.hide();
        return;
    }

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
            $addAttendanceResults.html(
                `<div class="alert alert-danger">Error loading students: ${error.message}</div>`
            );
            $addAttendanceForm.hide();
        }
    }

    function populateStudents(students) {
        $attendanceRecordsDiv.empty();

        if (students.length === 0) {
            $attendanceRecordsDiv.html('<p>No students found for this course.</p>');
            return;
        }

        const $formGroup = $('<div>').addClass('form-group');
        const $listGroup = $('<div>').addClass('list-group');

        students.forEach(student => {
            const $listItem = $('<div>')
                .addClass('list-group-item d-flex justify-content-between align-items-center');

            const $checkboxDiv = $('<div>').addClass('form-check');

            const $checkbox = $('<input>')
                .addClass('form-check-input student-checkbox')
                .attr({ type: 'checkbox', value: student.id, id: `student-${student.id}` });

            const $label = $('<label>')
                .addClass('form-check-label')
                .attr('for', `student-${student.id}`)
                .text(`${student.name} ${student.surname} (ID: ${student.id})`);

            $checkboxDiv.append($checkbox, $label);

            const $statusSelect = $('<select>')
                .addClass('form-select status-select w-auto')
                .attr('required', false)
                .prop('disabled', true)
                .html(`
                    <option value="" disabled selected>Select status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                `);

            $checkbox.on('change', () => {
                $statusSelect.prop('disabled', !$checkbox.is(':checked'));
                $statusSelect.attr('required', $checkbox.is(':checked'));
                if (!$checkbox.is(':checked')) {
                    $statusSelect.val('');
                }
            });

            $listItem.append($checkboxDiv, $statusSelect);
            $listGroup.append($listItem);
        });

        $formGroup.append($listGroup);
        $attendanceRecordsDiv.append($formGroup);
    }

    fetchStudents(courseId);

    $addAttendanceForm.on('submit', async function (e) {
        e.preventDefault();

        const date = $('#attendanceDateAdd').val();

        const records = [];
        $attendanceRecordsDiv.find('.list-group-item').each(function () {
            const $checkbox = $(this).find('.student-checkbox');
            if ($checkbox.is(':checked')) {
                const studentId = $checkbox.val();
                const status = $(this).find('.status-select').val();
                if (studentId && status) {
                    records.push({ studentId, status });
                }
            }
        });

        if (!date || records.length === 0) {
            $addAttendanceResults.html(
                '<div class="alert alert-warning">Please select a date and ensure at least one student is selected with a status.</div>'
            );
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

                $addAttendanceResults.html(message);
                $addAttendanceForm.trigger('reset');
                $attendanceRecordsDiv.empty();
                $('#attendanceDateAdd').val(today);
                fetchStudents(courseId);
            } else {
                $addAttendanceResults.html(`<div class="alert alert-danger">${data.message}</div>`);
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            $addAttendanceResults.html(
                `<div class="alert alert-danger">Error submitting attendance: ${error.message}</div>`
            );
        }
    });
});
