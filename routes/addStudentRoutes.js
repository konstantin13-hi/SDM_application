import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function (db) {

    // Добавление студента
    router.post('/add-student',authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { name, surname } = req.body;

        const query = `INSERT INTO students (name, surname, teacher_id) VALUES (?, ?, ?)`;
        db.query(query, [name, surname, teacherId], (err, results) => {
            if (err) {
                console.error('Error adding student:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ message: 'Student successfully added!' });
        });
    });

    // Получение студентов
    router.get('/my-students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        console.log(teacherId);
        const query = `
            SELECT *
            FROM students
            WHERE teacher_id = ?`;

        db.query(query, [teacherId], (err, results) => {
            if (err) {
                console.error('Error finding students:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            console.log("here is result")
            console.log(results);
            res.json({ students: results }); // Отправляем найденные студенты
        });
    });

    // Удаление студента
    router.delete('/delete-student/:id', authMiddleware, (req, res) => {
        const studentId = req.params.id; // ID студента из параметров
        console.log("here is id")
        console.log(studentId)
        const query = 'DELETE FROM students WHERE id = ? AND teacher_id = ?';

        db.query(query, [studentId, req.user.id], (err, results) => {
            if (err) {
                console.error('Error deleting student:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Student not found or does not belong to you.' });
            }
            res.json({ message: 'Student successfully deleted!' }); // Сообщение об успешном удалении
        });
    });

    return router;
}
