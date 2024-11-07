// public/js/courses-handler.js

function displayMessage(message, type) {
  const messageDiv = document.getElementById('message-container');
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type}`;
  messageDiv.classList.remove('d-none');  // Upewnij się, że jest widoczny

  setTimeout(() => {
    messageDiv.classList.add('d-none');   // Ukryj po kilku sekundach
  }, 3000);
}

// Funkcja do aktualizacji listy kursów po usunięciu
function updateCourseList() {
  // Pobieranie kursów (analogicznie jak na początku skryptu)
}

document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const coursesList = document.getElementById('courses-list');
  let courseToDelete = null;  // Przechowywanie danych kursu do usunięcia

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  fetch('http://localhost:3000/my-courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
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
            <a href="addTest.html?courseId=${course.id}" class="btn btn-warning ml-2">Add Test</a> <!-- Nowy przycisk -->
            <button class="btn btn-danger ml-2 delete-course-btn" data-course-id="${course.id}" data-course-name="${course.name}">Delete Course</button>
          </div>
        `;
        coursesList.appendChild(courseItem);
      });

      // Dodanie event listenerów do przycisków usuwania
      document.querySelectorAll('.delete-course-btn').forEach(button => {
        button.addEventListener('click', function() {
          const courseId = this.getAttribute('data-course-id');
          const courseName = this.getAttribute('data-course-name');
          openDeleteModal(courseId, courseName);
        });
      });
    } else {
      coursesList.innerHTML = '<p>No courses found.</p>';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    coursesList.innerHTML = '<p>Error loading courses.</p>';
  });

  function openDeleteModal(courseId, courseName) {
    courseToDelete = { id: courseId, name: courseName }; // Przechowaj ID i nazwę kursu
    document.getElementById('confirmCourseName').value = ''; // Wyczyść pole input
    document.getElementById('error-message').classList.add('d-none'); // Ukryj komunikat błędu
    $('#confirmDeleteModal').modal('show'); // Pokaż modal
  }

  document.getElementById('confirmDeleteButton').addEventListener('click', function() {
    const userInput = document.getElementById('confirmCourseName').value.trim();

    // Sprawdzenie poprawności nazwy kursu
    if (userInput === courseToDelete.name) {
      deleteCourse(courseToDelete.id);
      $('#confirmDeleteModal').modal('hide'); // Zamknij modal po usunięciu
    } else {
      // Wyświetl komunikat o błędzie
      document.getElementById('error-message').classList.remove('d-none');
    }
  });

  // Funkcja usuwania kursu
  function deleteCourse(courseId) {
    console.log("Deleting course with ID:", courseId);
    fetch(`http://localhost:3000/delete-course/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        displayMessage(data.message, 'success');

        // Usuń kurs z listy w DOM
        const courseElement = document.querySelector(`.delete-course-btn[data-course-id="${courseId}"]`).closest('.card');
        if (courseElement) {
          courseElement.remove();
        }

      } else {
        displayMessage('Error deleting course', 'danger');
      }
    })
    .catch(error => {
      console.error("Error:", error);
      displayMessage('Error deleting course', 'danger');
    });
  }
});
