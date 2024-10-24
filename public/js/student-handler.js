


document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = urlParams.get('teacherId'); // Получаем teacherId из URL

    document.getElementById('add-student-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const studentName = document.getElementById('studentName').value;
        const studentSurname = document.getElementById('studentSurname').value;

        fetch(`http://localhost:3000/add-student`, { // Обновленный URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: studentName,
                surname: studentSurname
            })
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('response-message').textContent = data.message;
                // Можно обновить список студентов для удаления после добавления
            })
            .catch(error => {
                console.error('Error adding student:', error);
            });
    });


    // Загрузка студентов
    fetch('http://localhost:3000/my-students', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Передаем токен в заголовке Authorization
        }
    })
        .then(response => response.json())
        .then(data => {
            const studentSelect = document.getElementById('studentSelect');
            studentSelect.innerHTML = ""; // Очищаем предыдущие опции


            if (data.students && data.students.length > 0) {
                data.students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id; // ID студента
                    option.textContent = `${student.name} ${student.surname}`; // ФИО студента
                    studentSelect.appendChild(option); // Добавляем опцию в выпадающий список
                });
            } else {
                studentSelect.innerHTML = '<option>No students found</option>'; // Если нет студентов
            }
        })
        .catch(error => console.error("Error:", error));

    // Обработка удаления студента
    document.getElementById('delete-student-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const studentId = document.getElementById('studentSelect').value; // Получаем ID выбранного студента

        // Отправляем запрос на удаление студента
        fetch(`http://localhost:3000/delete-student/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Передаем токен в заголовке Authorization
            }
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('response-message').textContent = data.message; // Показываем сообщение
                // Перезагружаем список студентов
                return fetch('http://localhost:3000/my-students', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            })
            .then(response => response.json())
            .then(data => {
                const studentSelect = document.getElementById('studentSelect');
                studentSelect.innerHTML = ""; // Очищаем предыдущие опции

                if (data.students && data.students.length > 0) {
                    data.students.forEach(student => {
                        const option = document.createElement('option');
                        option.value = student.id; // ID студента
                        option.textContent = `${student.name} ${student.surname}`; // ФИО студента
                        studentSelect.appendChild(option); // Добавляем опцию в выпадающий список
                    });
                } else {
                    studentSelect.innerHTML = '<option>No students found</option>'; // Если нет студентов
                }
            })
            .catch(error => console.error("Error:", error));
    });

});
