// public/js/add-course-handler.js

$('#course-form').on('submit', async function (event) {
    event.preventDefault();

    const formData = $(this).serializeArray(); // Сериализуем данные формы
    const data = {
        courseName: formData.find(item => item.name === 'courseName')?.value || '',
        students: $('input[name="student"]:checked').map((_, checkbox) => $(checkbox).val()).get(),
        startDate: formData.find(item => item.name === 'startDate')?.value || '',
    };

    // Проверяем, что выбран хотя бы один студент
    if (data.students.length === 0) {
        $('#response-message').text('Please select at least one student.');
        return;
    }

    console.log('Sending data:', data);

    // Получаем токен из localStorage
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            // Если токен недействителен, перенаправляем на страницу входа
            window.location.href = 'loginPage.html';
            return;
        }

        const result = await response.json();
        $('#response-message').text(result.message);
    } catch (error) {
        $('#response-message').text('Error: ' + error);
    }
});

// Инициализация страницы
$(async function() {
    const $studentContainer = $('#students');
    const $searchInput = $('#studentSearch');
    const $prevPageBtn = $('#prev-page');
    const $nextPageBtn = $('#next-page');
    const $paginationUl = $('.pagination');

    let currentPage = 1;
    const limit = 10;
    let totalPages = 1;
    let currentSearch = '';

    // Функция для получения списка студентов
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
            $('#response-message').text('Error loading students: ' + error.message);
        }
    }

    // Функция отображения списка студентов
    function renderStudents(students) {
        $studentContainer.empty(); // Очищаем контейнер студентов

        students.forEach(student => {
            const $checkbox = $('<input>', {
                type: 'checkbox',
                name: 'student',
                value: student.id,
                id: `student-${student.id}`,
                class: 'form-check-input'
            });

            const $label = $('<label>', {
                for: `student-${student.id}`,
                class: 'form-check-label',
                text: `${student.name} ${student.surname}`
            });

            const $div = $('<div>', { class: 'form-check' });
            $div.append($checkbox, $label);
            $studentContainer.append($div);
        });
    }

    // Функция настройки пагинации
    function setupPagination(pagination) {
        totalPages = pagination.totalPages;
        currentPage = pagination.currentPage;

        // Включаем/отключаем кнопки "Previous" и "Next"
        $prevPageBtn.toggleClass('disabled', currentPage === 1);
        $nextPageBtn.toggleClass('disabled', currentPage === totalPages);

        // Удаляем существующие номера страниц
        $paginationUl.find('.page-number').remove();

        // Добавляем новые номера страниц
        for (let i = 1; i <= totalPages; i++) {
            const $li = $('<li>', {
                class: `page-item page-number${i === currentPage ? ' active' : ''}`
            }).append(
                $('<a>', { href: '#', class: 'page-link', text: i })
            );

            $paginationUl.find('#next-page').before($li);

            $li.on('click', function(e) {
                e.preventDefault();
                if (currentPage === i) return;
                currentPage = i;
                fetchStudents();
            });
        }

        // Обработка кнопки "Previous"
        $prevPageBtn.off('click').on('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchStudents();
            }
        });

        // Обработка кнопки "Next"
        $nextPageBtn.off('click').on('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                fetchStudents();
            }
        });
    }

    // Обработка ввода в поле поиска
    $searchInput.on('input', function() {
        currentSearch = $(this).val().trim();
        currentPage = 1; // Сбрасываем на первую страницу
        fetchStudents();
    });

    // Загружаем студентов при загрузке страницы
    await fetchStudents();
});
