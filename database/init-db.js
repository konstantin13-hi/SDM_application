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
    console.log('DB connected successfully');
} catch (err) {
    console.error('Error:', err);
} finally {
    db.end();
}

