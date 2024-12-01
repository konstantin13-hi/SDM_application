$(document).ready(function() {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = urlParams.get('teacherId');

    // Handle adding student
    $('#add-student-form').on('submit', function (e) {
        e.preventDefault();

        const studentName = $('#studentName').val();
        const studentSurname = $('#studentSurname').val();
        const namePattern = /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;

        if (!namePattern.test(studentName) || !namePattern.test(studentSurname)) {
            displayMessage('Only letters are allowed in Student Name and Surname', 'danger', 'response-message');
            return;
        }

        $.ajax({
            url: 'http://localhost:3000/add-student',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ name: studentName, surname: studentSurname }),
            success: function(data) {
                displayMessage(data.message, 'success', 'response-message');
                updateStudentList();
                $('#studentName').val('');
                $('#studentSurname').val('');
            },
            error: function() {
                displayMessage('Error adding student', 'danger', 'response-message');
            }
        });
    });

    // Handle deleting student
    $('#delete-student-form').on('submit', function (e) {
        e.preventDefault();

        const studentId = $('#studentSelect').val();

        $.ajax({
            url: `http://localhost:3000/delete-student/${studentId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(data) {
                displayMessage(data.message, 'success', 'response-message2');
                updateStudentList();
                $('#searchStudent').val('');
            },
            error: function() {
                displayMessage('Error deleting student', 'danger', 'response-message2');
            }
        });
    });

    // Function to display messages
    function displayMessage(message, type, elementId) {
        const messageDiv = $(`#${elementId}`);
        messageDiv.text(message);
        messageDiv.removeClass('d-none').addClass(`alert alert-${type}`);

        setTimeout(function() {
            messageDiv.addClass('d-none');
        }, 3000);
    }

    // Update student list
    function updateStudentList() {
        $.ajax({
            url: 'http://localhost:3000/my-students',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(data) {
                const studentSelect = $('#studentSelect');
                studentSelect.empty();

                if (data.students && data.students.length > 0) {
                    data.students.forEach(student => {
                        studentSelect.append(new Option(`${student.name} ${student.surname}`, student.id));
                    });
                } else {
                    studentSelect.append('<option>No students found</option>');
                }
            },
            error: function() {
                console.error('Error fetching students');
            }
        });
    }

    // Filter students
    function filterStudents() {
        const searchValue = $('#searchStudent').val().toLowerCase();
        const options = $('#studentSelect option');

        let found = false;

        options.each(function() {
            const option = $(this);
            const studentText = option.text().toLowerCase();

            if (studentText.includes(searchValue)) {
                option.show();
                $('#studentSelect').val(option.val());
                found = true;
                return false;
            } else {
                option.hide();
            }
        });

        if (!found) {
            $('#studentSelect').val('');
        }
    }

    $('#searchButton').on('click', function (e) {
        e.preventDefault();
        filterStudents();
    });

    // Initialize
    updateStudentList();
});
