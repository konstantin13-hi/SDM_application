<<<<<<< Updated upstream
document.getElementById('course-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
      courseName: formData.get('courseName'),
      teacher: formData.get('teacher'),
      students: Array.from(document.querySelectorAll('input[name="student"]:checked')).map(checkbox => checkbox.value), 
      startDate: formData.get('startDate'),
    };

    console.log('Sending data:', data); 

    try {
      const response = await fetch('http://localhost:3000/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      document.getElementById('response-message').textContent = result.message;
    } catch (error) {
      document.getElementById('response-message').textContent = 'Error: ' + error;
    }
});


window.onload = async function() {
    try {
        const teacherResponse = await fetch('http://localhost:3000/teachers');
        if (!teacherResponse.ok) {
            throw new Error('Failed to fetch teachers');
        }
        const teachers = await teacherResponse.json();

        const studentResponse = await fetch('http://localhost:3000/students');
        if (!studentResponse.ok) {
            throw new Error('Failed to fetch students');
        }
        const students = await studentResponse.json();

        const teacherSelect = document.getElementById('teacher');
        students.forEach(student => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'student';
            checkbox.value = student.id;

            const label = document.createElement('label');
            label.textContent = student.name;

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            document.getElementById('students').appendChild(div);
        });

        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading teachers or students:', error);
    }
=======
// js/add-course-handler.js

document.getElementById('course-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(this);
  const data = {
      courseName: formData.get('courseName'),
      students: Array.from(document.querySelectorAll('input[name="student"]:checked')).map(checkbox => checkbox.value),
      startDate: formData.get('startDate'),
  };

  // Walidacja, czy wybrano co najmniej jednego studenta
  if (data.students.length === 0) {
      document.getElementById('response-message').textContent = 'Please select at least one student.';
      return;
  }

  console.log('Sending data:', data);

  // Pobranie tokenu z localStorage
  const token = localStorage.getItem('token'); // Dostosuj klucz, jeśli jest inny

  try {
      const response = await fetch('http://localhost:3000/courses', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Dodanie tokenu do nagłówka
          },
          body: JSON.stringify(data)
      });

      if (response.status === 401) {
          // Token nieważny lub brak tokenu - przekierowanie do logowania
          window.location.href = 'loginPage.html';
          return;
      }

      const result = await response.json();
      document.getElementById('response-message').textContent = result.message;
  } catch (error) {
      document.getElementById('response-message').textContent = 'Error: ' + error;
  }
});

// Implementacja wyszukiwania i paginacji
window.onload = async function() {
  const studentContainer = document.getElementById('students');
  const searchInput = document.getElementById('studentSearch');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const paginationUl = document.querySelector('.pagination');

  let currentPage = 1;
  const limit = 10;
  let totalPages = 1;
  let currentSearch = '';

  // Funkcja do pobierania studentów z backendu
  async function fetchStudents() {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3000/students?search=${encodeURIComponent(currentSearch)}&page=${currentPage}&limit=${limit}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          if (!response.ok) {
              throw new Error('Failed to fetch students');
          }
          const data = await response.json();
          console.log('Fetched students:', data);

          renderStudents(data.students);
          setupPagination(data.pagination);
      } catch (error) {
          console.error('Error loading students:', error);
          document.getElementById('response-message').textContent = 'Error loading students: ' + error.message;
      }
  }

  // Funkcja do renderowania studentów w interfejsie
  function renderStudents(students) {
      studentContainer.innerHTML = ''; // Czyścimy poprzednie wyniki

      // Renderowanie poszczególnych studentów
      students.forEach(student => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'student';
          checkbox.value = student.id;
          checkbox.id = `student-${student.id}`; // Dodanie unikalnego ID

          const label = document.createElement('label');
          label.htmlFor = `student-${student.id}`; // Powiązanie label z checkbox
          label.textContent = `${student.name} ${student.surname}`; // Wyświetlanie imienia i nazwiska

          const div = document.createElement('div');
          div.classList.add('form-check'); // Klasa Bootstrap dla lepszej stylizacji
          checkbox.classList.add('form-check-input');
          label.classList.add('form-check-label');

          div.appendChild(checkbox);
          div.appendChild(label);
          studentContainer.appendChild(div);
      });
  }

  // Funkcja do ustawiania paginacji
  function setupPagination(pagination) {
      totalPages = pagination.totalPages;
      currentPage = pagination.currentPage;

      // Wyłączenie/wyłączenie przycisków "Previous" i "Next"
      document.getElementById('prev-page').classList.toggle('disabled', currentPage === 1);
      document.getElementById('next-page').classList.toggle('disabled', currentPage === totalPages);

      // Usunięcie istniejących numerów stron
      const existingPageNumbers = document.querySelectorAll('.page-number');
      existingPageNumbers.forEach(page => page.remove());

      // Dodanie nowych numerów stron
      for (let i = 1; i <= totalPages; i++) {
          const li = document.createElement('li');
          li.classList.add('page-item', 'page-number');
          if (i === currentPage) li.classList.add('active');
          li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
          paginationUl.insertBefore(li, document.getElementById('next-page'));

          // Obsługa kliknięcia numeru strony
          li.addEventListener('click', function(e) {
              e.preventDefault();
              if (currentPage === i) return;
              currentPage = i;
              fetchStudents();
          });
      }

      // Obsługa kliknięcia przycisku "Previous"
      document.getElementById('prev-page').onclick = function(e) {
          e.preventDefault();
          if (currentPage > 1) {
              currentPage--;
              fetchStudents();
          }
      };

      // Obsługa kliknięcia przycisku "Next"
      document.getElementById('next-page').onclick = function(e) {
          e.preventDefault();
          if (currentPage < totalPages) {
              currentPage++;
              fetchStudents();
          }
      };
  }

  // Obsługa wyszukiwania
  searchInput.addEventListener('input', function() {
      currentSearch = this.value.trim();
      currentPage = 1; // Resetowanie na pierwszą stronę przy nowym wyszukiwaniu
      fetchStudents();
  });

  // Początkowe pobranie studentów
  fetchStudents();
>>>>>>> Stashed changes
};
