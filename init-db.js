import fs from 'fs';
import mysql from 'mysql2/promise'; // Используем промис-версию для более удобной работы

// Читаем SQL-скрипт
const sql = fs.readFileSync('setup.sql', 'utf8');

// Подключение к MySQL
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyPa$$word1',
    multipleStatements: true
});


try {
    await db.query(sql);
    console.log('База данных и таблицы успешно созданы');
} catch (err) {
    console.error('Ошибка выполнения скрипта:', err);
} finally {
    db.end();
}

