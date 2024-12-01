$(document).ready(function () {
    const courseId = new URLSearchParams(window.location.search).get('courseId');

    $.ajax({
        url: `http://localhost:3000/gr/course/${courseId}/final-grades`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        success: function (data) {
            const $gradesTableBody = $('#grades-table-body');
            const $noStudentsAlert = $('#no-students');

            if (data.students && data.students.length > 0) {
                $noStudentsAlert.addClass('d-none');
                $.each(data.students, function (index, student) {
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
                    $gradesTableBody.append(row);
                });
            } else {
                $noStudentsAlert.removeClass('d-none');
            }
        },
        error: function (error) {
            console.error('Error fetching final grades:', error);
        }
    });
});
