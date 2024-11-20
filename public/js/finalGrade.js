document.addEventListener('DOMContentLoaded', () => {
    const courseId = new URLSearchParams(window.location.search).get('courseId');

    fetch(`http://localhost:3000/gr/course/${courseId}/final-grades`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
        .then(r => r.json())
        .then(data => {
            const gradesTableBody = document.getElementById('grades-table-body');
            const noStudentsAlert = document.getElementById('no-students');

            if (data.students && data.students.length > 0) {
                noStudentsAlert.classList.add('d-none');
                data.students.forEach((student, index) => {
                    // Проверка значения final_grade
                    const gradeValue = student.final_grade !== null ? parseFloat(student.final_grade) : null;

                    // Определяем цвет на основе оценки
                    let gradeColor = '';
                    if (gradeValue === null) {
                        gradeColor = ''; // Без цвета, если оценки нет
                    } else if (gradeValue < 3) {
                        gradeColor = 'bg-danger'; // Красный для низкой оценки
                    } else if (gradeValue >= 3 && gradeValue < 4) {
                        gradeColor = 'bg-warning'; // Желтый для средней оценки
                    } else {
                        gradeColor = 'bg-success'; // Зеленый для высокой оценки
                    }

                    // Добавляем строку в таблицу
                    const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${student.name}</td>
                            <td>${student.surname}</td>
                            <td class="${gradeColor} text-white">
                                ${gradeValue !== null ? gradeValue.toFixed(2) : 'N/A'}
                            </td>
                        </tr>
                    `;
                    gradesTableBody.innerHTML += row;
                });
            } else {
                noStudentsAlert.classList.remove('d-none');
            }
        })
        .catch(error => {
            console.error('Error fetching final grades:', error);
        });
});
