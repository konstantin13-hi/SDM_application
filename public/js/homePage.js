// Получаем токен из localStorage
const token = localStorage.getItem('token');

if (!token) {
    // Если токена нет, перенаправляем пользователя на страницу логина
    window.location.href = 'login.html';
} else {
    // Если токен существует, выполняем запрос
    fetch('http://localhost:3000/home', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Передаем токен в заголовке запроса
        }
    })
        .then(response => response.json())
        .then(data => {

            if (data.message) {
                console.log(data.message);
                document.getElementById('message').textContent = data.message;
            } else {
                document.getElementById('message').textContent = 'Error fetching HomePage data.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

