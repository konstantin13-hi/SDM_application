<<<<<<< Updated upstream
// Получаем токен из localStorage
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';  // Если токена нет, перенаправляем на страницу логина
} else {
  // Запрашиваем курсы текущего пользователя
=======
// public/js/courses-handler.js

// Pobieramy token z localStorage
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';  // Jeśli tokenu brak, przekieruj na stronę logowania
} else {
  // Pobieramy kursy aktualnego użytkownika
>>>>>>> Stashed changes
  fetch('http://localhost:3000/my-courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
<<<<<<< Updated upstream
      .then(response => response.json())
      .then(data => {
        const coursesList = document.getElementById('courses-list');

        if (data.courses && data.courses.length > 0) {
          data.courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'card mb-3';
            courseItem.innerHTML = `
                            <div class="card-body">
                                <h5 class="card-title">${course.name}</h5>
                                <p class="card-text">Start Date: ${course.start_date}</p>
                                <a href="course-details.html?id=${course.id}" class="btn btn-primary">View Details</a>
                            </div>
                        `;
            coursesList.appendChild(courseItem);
          });
        } else {
          coursesList.innerHTML = '<p>No courses found.</p>';
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
=======
  .then(response => response.json())
  .then(data => {
    const coursesList = document.getElementById('courses-list');

    if (data.courses && data.courses.length > 0) {
      data.courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'card mb-3';
        courseItem.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${course.name}</h5>
            <p class="card-text">Start Date: ${course.start_date}</p>
            <a href="course-details.html?id=${course.id}" class="btn btn-primary">View Details</a>
            <a href="addAttendance.html?courseId=${course.id}" class="btn btn-success ml-2">Add Attendance</a>
            <a href="viewAttendance.html?courseId=${course.id}" class="btn btn-info ml-2">View Attendance</a>
          </div>
        `;
        coursesList.appendChild(courseItem);
      });
    } else {
      coursesList.innerHTML = '<p>No courses found.</p>';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    const coursesList = document.getElementById('courses-list');
    coursesList.innerHTML = '<p>Error loading courses.</p>';
  });
>>>>>>> Stashed changes
}
