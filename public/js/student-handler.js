document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = urlParams.get('teacherId');

    // Obsługa dodawania studenta
    document.getElementById('add-student-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const studentName = document.getElementById('studentName').value;
        const studentSurname = document.getElementById('studentSurname').value;
        const namePattern = /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;

        // Walidacja pól
        if (!namePattern.test(studentName) || !namePattern.test(studentSurname)) {
            displayMessage('Only letters are allowed in Student Name and Surname', 'danger', 'response-message');
            return;
        }

        fetch(`http://localhost:3000/add-student`, {
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
            .then(async (response) => {
                const data = await response.json();

                if (response.ok) {
                    displayMessage(data.message, 'success', 'response-message');
                    updateStudentList();

                    // Czyścimy formularz
                    document.getElementById('studentName').value = ''; // Czyścimy pole imienia
                    document.getElementById('studentSurname').value = ''; // Czyścimy pole nazwiska
                } else {
                    displayMessage('Error adding student', 'danger', 'response-message');
                }
            })
            .catch(error => {
                console.error('Error adding student:', error);
                displayMessage('Error adding student', 'danger', 'response-message');
            });
    });

    // Obsługa usuwania studenta
    document.getElementById('delete-student-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const studentId = document.getElementById('studentSelect').value;

        fetch(`http://localhost:3000/delete-student/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async (response) => {
                const data = await response.json();

                if (response.ok) {
                    displayMessage(data.message, 'success', 'response-message2');
                    updateStudentList();
                    // Czyścimy formularz wyszukiwania studenta
                    document.getElementById('searchStudent').value = ''; // Wyczyszczenie pola wyszukiwania
                } else {
                    displayMessage('Error deleting student', 'danger', 'response-message2');
                }
            })
            .catch(error => {
                console.error("Error:", error);
                displayMessage('Error deleting student', 'danger', 'response-message2');
            });
    });

    // Funkcja wyświetlająca komunikat
    function displayMessage(message, type, elementId) {
        const messageDiv = document.getElementById(elementId);
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        messageDiv.classList.remove('d-none');

        // Ukrywanie komunikatu po 3 sekundach
        setTimeout(() => {
            messageDiv.classList.add('d-none');
        }, 3000);
    }

    function updateStudentList() {
        fetch('http://localhost:3000/my-students', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const studentSelect = document.getElementById('studentSelect');
                studentSelect.innerHTML = "";

                if (data.students && data.students.length > 0) {
                    data.students.forEach(student => {
                        const option = document.createElement('option');
                        option.value = student.id;
                        option.textContent = `${student.name} ${student.surname}`;
                        studentSelect.appendChild(option);
                    });
                } else {
                    studentSelect.innerHTML = '<option>No students found</option>';
                }
            })
            .catch(error => console.error("Error:", error));
    }

    // Funkcja do filtrowania studentów
    function filterStudents() {
        const searchValue = document.getElementById('searchStudent').value.toLowerCase();
        const options = document.getElementById('studentSelect').options;

        // Przywracamy wszystkie opcje przed filtrowaniem
        for (let i = 0; i < options.length; i++) {
            options[i].style.display = ''; // Pokazuje wszystkie opcje
        }

        let found = false; // Flaga do sprawdzenia, czy znaleziono studenta

        // Przechodzimy przez wszystkie opcje i ukrywamy te, które nie pasują
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const studentText = option.textContent.toLowerCase();

            // Filtrowanie opcji
            if (studentText.includes(searchValue)) {
                option.style.display = ''; // Pokazuje opcję
                // Ustawiamy wartość studentSelect na pasującego studenta
                document.getElementById('studentSelect').value = option.value; 
                found = true; // Ustaw flagę na true
                break; // Przerywamy pętlę po znalezieniu pierwszego pasującego studenta
            } else {
                option.style.display = 'none'; // Ukrywa opcję
            }
        }

        // Jeśli nie znaleziono pasującego studenta, ustaw wartość na pustą
        if (!found) {
            document.getElementById('studentSelect').value = '';
        }
    }

    // Nasłuchiwacz kliknięcia przycisku wyszukiwania
    document.getElementById('searchButton').addEventListener('click', (e) => {
        e.preventDefault(); // Zapobiega domyślnemu działaniu formularza
        filterStudents(); // Wywołuje funkcję filtrującą
    });


    updateStudentList();
});
