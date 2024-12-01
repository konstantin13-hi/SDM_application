$('#user-form').on('submit', async function(event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    const formData = $(this).serializeArray(); // Сериализуем данные формы
    const data = {};
    formData.forEach(item => {
        data[item.name] = item.value;
    });

    try {
        const response = await fetch('http://localhost:3000/add-teacher', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        $('#response-message').text(result.message);

    } catch (error) {
        $('#response-message').text('Error: ' + error);
    }
});
