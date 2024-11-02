<<<<<<< Updated upstream
=======
// routes/studentsRoute.js
>>>>>>> Stashed changes
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function (db) {

<<<<<<< Updated upstream
    // Добавление студента
    router.post('/add-student',authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { name, surname } = req.body;

=======
    // Dodawanie studenta
    router.post('/add-student', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { name, surname } = req.body;

        if (!name || !surname) {
            return res.status(400).json({ message: 'Name and surname are required' });
        }

>>>>>>> Stashed changes
        const query = `INSERT INTO students (name, surname, teacher_id) VALUES (?, ?, ?)`;
        db.query(query, [name, surname, teacherId], (err, results) => {
            if (err) {
                console.error('Error adding student:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ message: 'Student successfully added!' });
        });
    });

<<<<<<< Updated upstream
    // Получение студентов
    router.get('/my-students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        console.log(teacherId);
        const query = `
            SELECT *
            FROM students
            WHERE teacher_id = ?`;
=======
    // Pobieranie studentów przypisanych do nauczyciela (niepotrzebne teraz?)
    router.get('/my-students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        console.log(`Teacher ID: ${teacherId}`);
        const query = `
            SELECT id, name, surname
            FROM students
            WHERE teacher_id = ?
        `;
>>>>>>> Stashed changes

        db.query(query, [teacherId], (err, results) => {
            if (err) {
                console.error('Error finding students:', err);
                return res.status(500).json({ message: 'Server error' });
            }
<<<<<<< Updated upstream
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
=======
            console.log("Here is result:", results);
            res.json({ students: results });
        });
    });

    // Usuwanie studenta
    router.delete('/delete-student/:id', authMiddleware, (req, res) => {
        const studentId = req.params.id;
        console.log("Here is id:", studentId);
>>>>>>> Stashed changes
        const query = 'DELETE FROM students WHERE id = ? AND teacher_id = ?';

        db.query(query, [studentId, req.user.id], (err, results) => {
            if (err) {
                console.error('Error deleting student:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Student not found or does not belong to you.' });
            }
<<<<<<< Updated upstream
            res.json({ message: 'Student successfully deleted!' }); // Сообщение об успешном удалении
        });
    });

    router.get('/students', (req, res) => {
        db.query('SELECT id, name FROM students', (err, results) => {
            if (err) return res.status(500).json({ message: 'Error fetching students' });
            res.json(results);
        });
    });


=======
            res.json({ message: 'Student successfully deleted!' });
        });
    });

    // Pobieranie wszystkich studentów z obsługą wyszukiwania i paginacji
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

        // Najpierw pobierz całkowitą liczbę pasujących studentów
        db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : [], (err, countResult) => {
            if (err) {
                console.error('Error fetching student count:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const total = countResult[0].count;
            const totalPages = Math.ceil(total / limit);

            // Następnie pobierz same dane studentów
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

>>>>>>> Stashed changes
    return router;
}
