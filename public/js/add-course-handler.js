// public/js/add-course-handler.js

document.getElementById('course-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        courseName: formData.get('courseName'),
        // Uwaga: Pole 'teacher' nie jest potrzebne, ponieważ backend identyfikuje nauczyciela na podstawie tokenu.
        // Możesz je usunąć z formularza i z kodu frontendowego.
        // teacher: formData.get('teacher'),
        students: Array.from(document.querySelectorAll('input[name="student"]:checked')).map(checkbox => checkbox.value),
        startDate: formData.get('startDate'),
    };

    // Weryfikacja, że wybrano przynajmniej jednego studenta
    if (data.students.length === 0) {
        document.getElementById('response-message').textContent = 'Please select at least one student.';
        return;
    }

    console.log('Sending data:', data);

    // Pobranie tokenu z localStorage
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/courses', { // Zmieniono z /api/courses na /courses
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Dodanie tokenu do nagłówka
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            // Token jest nieważny lub brak - przekierowanie na stronę logowania
            window.location.href = 'loginPage.html';
            return;
        }

        const result = await response.json();
        document.getElementById('response-message').textContent = result.message;
    } catch (error) {
        document.getElementById('response-message').textContent = 'Error: ' + error;
    }
});

// Inicjalizacja strony
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

    // Funkcja do pobierania studentów z serwera
    async function fetchStudents() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/students?search=${encodeURIComponent(currentSearch)}&page=${currentPage}&limit=${limit}`, { // Zmieniono z /api/students na /students
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

    // Funkcja do wyświetlania studentów
    function renderStudents(students) {
        studentContainer.innerHTML = ''; // Czyszczenie poprzednich wyników

        // Wyświetlanie każdego studenta
        students.forEach(student => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'student';
            checkbox.value = student.id;
            checkbox.id = `student-${student.id}`; // Unikalny ID

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

        // Włączanie/wyłączanie przycisków "Previous" i "Next"
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages);

        // Usuwanie istniejących numerów stron
        const existingPageNumbers = document.querySelectorAll('.page-number');
        existingPageNumbers.forEach(page => page.remove());

        // Dodawanie nowych numerów stron
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item', 'page-number');
            if (i === currentPage) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            paginationUl.insertBefore(li, nextPageBtn);

            // Obsługa kliknięcia na numer strony
            li.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentPage === i) return;
                currentPage = i;
                fetchStudents();
            });
        }

        // Obsługa kliknięcia na przycisk "Previous"
        prevPageBtn.onclick = function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchStudents();
            }
        };

        // Obsługa kliknięcia na przycisk "Next"
        nextPageBtn.onclick = function(e) {
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

    // Pobranie studentów po załadowaniu strony
    fetchStudents();
};
