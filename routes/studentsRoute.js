// routes/studentsRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function (db) {
    /**
     * Endpoint do dodawania nowego studenta przypisanego do zalogowanego nauczyciela.
     * 
     * POST /add-student
     * Body: { name: String, surname: String }
     */
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

    /**
     * Endpoint do pobierania studentów przypisanych do zalogowanego nauczyciela.
     * Obsługuje paginację i wyszukiwanie.
     * 
     * GET /students?search=QUERY&page=NUM&limit=NUM
     */
    router.get('/students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) as count FROM students WHERE teacher_id = ?`;
        let dataQuery = `SELECT id, name, surname FROM students WHERE teacher_id = ?`;
        let params = [teacherId];

        if (search) {
            countQuery += ` AND (name LIKE ? OR surname LIKE ?)`;
            dataQuery += ` AND (name LIKE ? OR surname LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        dataQuery += ` ORDER BY name ASC, surname ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Najpierw policz całkowitą liczbę studentów
        db.query(countQuery, search ? [teacherId, `%${search}%`, `%${search}%`] : [teacherId], (err, countResult) => {
            if (err) {
                console.error('Error fetching student count:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const total = countResult[0].count;
            const totalPages = Math.ceil(total / limit);

            // Teraz pobierz dane studentów
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

    /**
     * Endpoint do pobierania wszystkich studentów przypisanych do nauczyciela bez paginacji.
     * 
     * GET /my-students
     */
    router.get('/my-students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const query = `
            SELECT id, name, surname
            FROM students
            WHERE teacher_id = ?
            ORDER BY name ASC, surname ASC
        `;

        db.query(query, [teacherId], (err, results) => {
            if (err) {
                console.error('Error finding students:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ students: results });
        });
    });

    /**
     * Endpoint do usuwania studenta przypisanego do zalogowanego nauczyciela.
     * 
     * DELETE /delete-student/:id
     */
    router.delete('/delete-student/:id', authMiddleware, (req, res) => {
        const studentId = req.params.id;
        const teacherId = req.user.id;
        const query = 'DELETE FROM students WHERE id = ? AND teacher_id = ?';

        db.query(query, [studentId, teacherId], (err, results) => {
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

    return router;
}
