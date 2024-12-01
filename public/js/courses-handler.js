$(document).ready(function () {
  const token = localStorage.getItem('token');
  const $coursesList = $('#courses-list');
  let courseToDelete = null; // Переменная для хранения данных курса для удаления

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Получение списка курсов
  $.ajax({
    url: 'http://localhost:3000/my-courses',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    success: function (data) {
      if (data.courses && data.courses.length > 0) {
        data.courses.forEach(course => {
          const courseItem = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${course.name}</h5>
                                <p class="card-text">Start Date: ${course.start_date}</p>
                                <a href="course-details.html?id=${course.id}" class="btn btn-primary">View Details</a>
                                <a href="addAttendance.html?courseId=${course.id}" class="btn btn-success ml-2">Add Attendance</a>
                                <a href="viewAttendance.html?courseId=${course.id}" class="btn btn-info ml-2">View Attendance</a>
                                <a href="addAssessment.html?courseId=${course.id}" class="btn btn-warning ml-2">Add Assessment</a>
                                <a href="gradeStudents.html?courseId=${course.id}" class="btn btn-secondary ml-2">Grade Students</a>
                                <a href="finalGrade.html?courseId=${course.id}" class="btn btn-dark ml-2">Final Grade</a>
                                <button class="btn btn-danger ml-2 delete-course-btn" data-course-id="${course.id}" data-course-name="${course.name}">Delete Course</button>
                            </div>
                        </div>`;
          $coursesList.append(courseItem);
        });

        // Добавление обработчиков событий на кнопки удаления
        $('.delete-course-btn').on('click', function () {
          const courseId = $(this).data('course-id');
          const courseName = $(this).data('course-name');
          openDeleteModal(courseId, courseName);
        });
      } else {
        $coursesList.html('<p>No courses found.</p>');
      }
    },
    error: function () {
      $coursesList.html('<p>Error loading courses.</p>');
    }
  });

  function openDeleteModal(courseId, courseName) {
    courseToDelete = { id: courseId, name: courseName }; // Сохранение ID и имени курса
    $('#confirmCourseName').val(''); // Очистка поля ввода
    $('#error-message').addClass('d-none'); // Скрыть сообщение об ошибке
    $('#confirmDeleteModal').modal('show'); // Показать модальное окно
  }

  $('#confirmDeleteButton').on('click', function () {
    const userInput = $('#confirmCourseName').val().trim();

    // Проверка правильности имени курса
    if (userInput === courseToDelete.name) {
      deleteCourse(courseToDelete.id);
      $('#confirmDeleteModal').modal('hide'); // Закрыть модальное окно после удаления
    } else {
      $('#error-message').removeClass('d-none'); // Показать сообщение об ошибке
    }
  });

  // Функция удаления курса
  function deleteCourse(courseId) {
    $.ajax({
      url: `http://localhost:3000/delete-course/${courseId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: function (data) {
        displayMessage(data.message, 'success');

        // Удалить курс из DOM
        $(`.delete-course-btn[data-course-id="${courseId}"]`).closest('.card').remove();
      },
      error: function () {
        displayMessage('Error deleting course', 'danger');
      }
    });
  }

  function displayMessage(message, type) {
    const $messageDiv = $('#message-container');
    $messageDiv.text(message)
        .removeClass()
        .addClass(`alert alert-${type}`)
        .removeClass('d-none');

    setTimeout(() => {
      $messageDiv.addClass('d-none');
    }, 3000);
  }
});
