import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

export default (db) => {

    // Регистрация
    router.post('/register', async (req, res) => {
        const { name, email, password } = req.body;

        // Проверка наличия пользователя с таким же email
        db.query('SELECT * FROM teachers WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Ошибка сервера' });
            if (results.length > 0) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);

            // Вставка нового пользователя в базу данных
            db.query('INSERT INTO teachers (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err) => {
                if (err) return res.status(500).json({ message: 'Ошибка при создании пользователя' });
                res.status(201).json({ message: 'Пользователь зарегистрирован' });
            });
        });
    });

    // Логин
    router.post('/login', (req, res) => {
        const { email, password } = req.body;

        // Поиск пользователя по email
        db.query('SELECT * FROM teachers WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Ошибка сервера' });
            if (results.length === 0) {
                return res.status(400).json({ message: 'Неправильный email или пароль' });
            }

            const user = results[0];

            // Проверка пароля
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неправильный email или пароль' });
            }

            // Генерация JWT токена
            const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });

            res.status(200).json({ message: 'Успешный вход', token });
        });
    });

    return router;
};
