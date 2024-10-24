import { loadNavbar } from '../components/Navbar.js';
import { loadModal } from '../components/Modal.js';


document.addEventListener("DOMContentLoaded", () => {

    function parseJwt(token) {
        const base64Url = token.split('.')[1]; // Получаем вторую часть (полезная нагрузка)
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Преобразуем из Base64URL в стандартный Base64
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')); // Декодируем Base64 и преобразуем в URI

        return JSON.parse(jsonPayload); // Парсим JSON строку в объект
    }
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'loginPage.html';
    }


    // Продолжайте загрузку вашего navbar и других компонентов
    loadNavbar();
    loadModal();

    // Обработчик для выхода
    document.getElementById('logoutButton').addEventListener('click', function () {
        localStorage.removeItem('token');
        window.location.href = 'loginPage.html';
    });
});
