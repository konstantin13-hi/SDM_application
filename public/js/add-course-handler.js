// js/add-course-handler.js

document.getElementById('course-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        courseName: formData.get('courseName'),
        teacher: formData.get('teacher'),
        students: Array.from(document.querySelectorAll('input[name="student"]:checked')).map(checkbox => checkbox.value),
        startDate: formData.get('startDate'),
    };

    // Валидация, чтобы убедиться, что выбран хотя бы один студент
    if (data.students.length === 0) {
        document.getElementById('response-message').textContent = 'Please select at least one student.';
        return;
    }

    console.log('Sending data:', data);

    // Получение токена из localStorage
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Добавление токена в заголовок
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            // Токен недействителен или отсутствует - перенаправление на страницу логина
            window.location.href = 'loginPage.html';
            return;
        }

        const result = await response.json();
        document.getElementById('response-message').textContent = result.message;
    } catch (error) {
        document.getElementById('response-message').textContent = 'Error: ' + error;
    }
});

// Инициализация страницы
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

    // Функция для получения студентов с сервера
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

    // Функция для отображения студентов
    function renderStudents(students) {
        studentContainer.innerHTML = ''; // Очистка предыдущих результатов

        // Отображение каждого студента
        students.forEach(student => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'student';
            checkbox.value = student.id;
            checkbox.id = `student-${student.id}`; // Уникальный ID

            const label = document.createElement('label');
            label.htmlFor = `student-${student.id}`; // Связывание label с checkbox
            label.textContent = `${student.name} ${student.surname}`; // Отображение имени и фамилии

            const div = document.createElement('div');
            div.classList.add('form-check'); // Класс Bootstrap для лучшей стилизации
            checkbox.classList.add('form-check-input');
            label.classList.add('form-check-label');

            div.appendChild(checkbox);
            div.appendChild(label);
            studentContainer.appendChild(div);
        });
    }

    // Функция для настройки пагинации
    function setupPagination(pagination) {
        totalPages = pagination.totalPages;
        currentPage = pagination.currentPage;

        // Включение/выключение кнопок "Previous" и "Next"
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages);

        // Удаление существующих номеров страниц
        const existingPageNumbers = document.querySelectorAll('.page-number');
        existingPageNumbers.forEach(page => page.remove());

        // Добавление новых номеров страниц
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item', 'page-number');
            if (i === currentPage) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            paginationUl.insertBefore(li, nextPageBtn);

            // Обработка клика на номер страницы
            li.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentPage === i) return;
                currentPage = i;
                fetchStudents();
            });
        }

        // Обработка клика на кнопку "Previous"
        prevPageBtn.onclick = function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchStudents();
            }
        };

        // Обработка клика на кнопку "Next"
        nextPageBtn.onclick = function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                fetchStudents();
            }
        };
    }

    // Обработка поиска
    searchInput.addEventListener('input', function() {
        currentSearch = this.value.trim();
        currentPage = 1; // Сброс на первую страницу при новом поиске
        fetchStudents();
    });

    // Первоначальное получение студентов
    fetchStudents();
};
