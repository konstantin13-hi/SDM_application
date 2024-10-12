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

import teacherRoutes from './routes/teacherRoutes.js';

app.use(teacherRoutes(db));






