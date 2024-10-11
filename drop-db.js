import mysql from 'mysql2/promise'; // Используем promise-версию mysql2

// Создаем подключение к базе данных
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // Имя пользователя MySQL
    password: 'MyPa$$word1', // Ваш пароль MySQL
});

// Удаляем базу данных
try {
    await db.query('DROP DATABASE IF EXISTS school');
    console.log('База данных "school" успешно удалена');
} catch (err) {
    console.error('Ошибка при удалении базы данных:', err);
} finally {
    // Закрываем соединение
    await db.end();
}
