// routes/studentsRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function (db) {
    // Добавление студента
    router.post('/add-student', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { name, surname } = req.body;

        if (!name || !surname) {
            return res.status(400).json({ message: 'Name and surname are required' });
        }

        const query = `INSERT INTO students (name, surname, teacher_id) VALUES (?, ?, ?)`;
        db.query(query, [name, surname, teacherId], (err) => {
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
        const query = `
            SELECT id, name, surname
            FROM students
            WHERE teacher_id = ?
        `;

        db.query(query, [teacherId], (err, results) => {
            if (err) {
                console.error('Error finding students:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ students: results });
        });
    });

    // Удаление студента
    router.delete('/delete-student/:id', authMiddleware, (req, res) => {
        const studentId = req.params.id;
        const query = 'DELETE FROM students WHERE id = ? AND teacher_id = ?';

        db.query(query, [studentId, req.user.id], (err, results) => {
            if (err) {
                console.error('Error deleting student:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Student not found or does not belong to you.' });
            }
            res.json({ message: 'Student successfully deleted!' });
        });
    });

    // Получение всех студентов с поддержкой поиска и пагинации
    router.get('/students', authMiddleware, (req, res) => {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) as count FROM students`;
        let dataQuery = `SELECT id, name, surname FROM students`;
        let params = [];

        if (search) {
            countQuery += ` WHERE name LIKE ? OR surname LIKE ?`;
            dataQuery += ` WHERE name LIKE ? OR surname LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
        }

        dataQuery += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : [], (err, countResult) => {
            if (err) {
                console.error('Error fetching student count:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const total = countResult[0].count;
            const totalPages = Math.ceil(total / limit);

            db.query(dataQuery, params, (err, dataResult) => {
                if (err) {
                    console.error('Error fetching students:', err);
                    return res.status(500).json({ message: 'Error fetching students' });
                }

                res.json({
                    students: dataResult,
                    pagination: {
                        total,
                        totalPages,
                        currentPage: page
                    }
                });
            });
        });
    });

    return router;
}
