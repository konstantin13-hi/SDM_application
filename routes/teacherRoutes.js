// routes/teacherRoutes.js
import express from 'express';

const router = express.Router();

export default function(db) {

    router.post('/add-teacher', (req, res) => {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Используем переданное подключение db для выполнения SQL-запроса
        const query = 'INSERT INTO teachers (name, email) VALUES (?, ?)';
        db.query(query, [name, email], (err, results) => {
            if (err) {
                console.error('Ошибка добавления данных:', err);
                return res.status(500).json({ message: 'Ошибка сервера' });
            }
            res.json({ message: 'Teacher successfully added successfully!' });
        });
    });



    return router;
}
