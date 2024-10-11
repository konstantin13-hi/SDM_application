// server.js
import express from 'express';

import cors from 'cors';




const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello, this is your API!');
});

app.post('/add-user', (req, res) => {
    const { name, email } = req.body; // Извлекаем данные из тела запроса

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    // Пример SQL-запроса для вставки данных в базу данных
    const query = 'INSERT INTO teachers (name, email) VALUES (?, ?)';
    db.query(query, [name, email], (err, results) => {
        if (err) {
            console.error('Ошибка добавления данных:', err);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
        res.json({ message: 'Пользователь успешно добавлен!' });
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

import mysql from 'mysql2';

// Подключение к локальной базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Имя пользователя MySQL
    password: 'MyPa$$word1',   // Пароль MySQL
    database: 'school'
});

// Проверка подключения
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключено к базе данных MySQL');
});


app.post('/add-user', async (req, res) => {
    const { name, email } = req.body; // Извлекаем данные из тела запроса

    try {
        // Вставляем данные в таблицу студентов
        await db.query('INSERT INTO students (name, email) VALUES (?, ?)', [name, email]);
        res.send('User added successfully!');
    } catch (err) {
        console.error('Ошибка при добавлении пользователя:', err);
        res.status(500).send('Error adding user.');
    }
});
