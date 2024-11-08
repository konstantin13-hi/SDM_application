// public/js/add-assessment-handler.js

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');

    if (!courseId) {
        displayMessage('No course selected. Please select a course from My Courses.', 'danger');
        return;
    }

    const form = document.getElementById('add-assessment-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const assessmentType = document.getElementById('assessmentType').value.trim();
        const assessmentWeight = parseFloat(document.getElementById('assessmentWeight').value);

        // Walidacja wagi oceny
        if (!assessmentType) {
            displayMessage('Please enter the type of assessment.', 'danger');
            return;
        }

        if (isNaN(assessmentWeight) || assessmentWeight < 1 || assessmentWeight > 100) {
            displayMessage('Please enter a valid weight between 1 and 100.', 'danger');
            return;
        }

        const assessmentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD

        const payload = {
            courseId: courseId,
            form_type: assessmentType,
            weight: assessmentWeight,
            date: assessmentDate
        };

        fetch('http://localhost:3000/grades/add-assessment', { // Endpoint do dodawania oceny
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        .then(async response => {
            const data = await response.json();
            if (response.ok) {
                displayMessage(data.message, 'success');
                form.reset();
            } else {
                displayMessage(data.message || 'Failed to add assessment.', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('Failed to add assessment.', 'danger');
        });
    });

    // Funkcja do wyświetlania komunikatów
    function displayMessage(message, type) {
        const messageDiv = document.getElementById('message-container');
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        messageDiv.classList.remove('d-none'); // Pokazanie komunikatu

        setTimeout(() => {
            messageDiv.classList.add('d-none'); // Ukrycie komunikatu po 3 sekundach
        }, 3000);
    }

    // Funkcja do wyświetlania Toasta
    function showToast(message, isSuccess = true) {
        const toastElement = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastBody');
        toastBody.textContent = message;
        if (isSuccess) {
            toastElement.classList.remove('text-bg-danger');
            toastElement.classList.add('text-bg-success');
        } else {
            toastElement.classList.remove('text-bg-success');
            toastElement.classList.add('text-bg-danger');
        }
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
});
