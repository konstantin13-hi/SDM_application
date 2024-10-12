document.getElementById('user-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        email: formData.get('email')
    };

    try {
        const response = await fetch('http://localhost:3000/add-teacher', {
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
