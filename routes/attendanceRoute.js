// routes/attendanceRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {

    // Endpoint do dodawania obecności
    router.post('/attendance/add', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, date, attendanceRecords } = req.body;

        // Sprawdzenie poprawności danych
        if (!courseId || !date || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Sprawdzenie, czy kurs należy do nauczyciela
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Przygotowanie danych do wstawienia
            const insertQuery = `INSERT INTO attendance (course_id, student_id, date, status) VALUES ?`;
            const values = attendanceRecords.map(record => [courseId, record.studentId, date, record.status]);

            db.query(insertQuery, [values], (err) => {
                if (err) {
                    console.error('Error adding attendance:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ message: 'Attendance successfully recorded!' });
            });
        });
    });

    // Endpoint do pobierania obecności dla kursu i daty
    router.get('/attendance/course/:courseId/date/:date', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, date } = req.params;

        // Sprawdzenie, czy kurs należy do nauczyciela
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Pobranie obecności
            const getAttendanceQuery = `
                SELECT a.student_id, s.name, s.surname, a.status
                FROM attendance a
                JOIN students s ON a.student_id = s.id
                WHERE a.course_id = ? AND a.date = ?
            `;
            db.query(getAttendanceQuery, [courseId, date], (err, attendanceResults) => {
                if (err) {
                    console.error('Error fetching attendance:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ attendance: attendanceResults });
            });
        });
    });

    // Endpoint do pobierania wszystkich dat obecności dla kursu
    router.get('/attendance/course/:courseId/dates', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId } = req.params;

        // Sprawdzenie, czy kurs należy do nauczyciela
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Pobranie unikalnych dat obecności
            const getDatesQuery = `
                SELECT DISTINCT date
                FROM attendance
                WHERE course_id = ?
                ORDER BY date DESC
            `;
            db.query(getDatesQuery, [courseId], (err, dateResults) => {
                if (err) {
                    console.error('Error fetching attendance dates:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ dates: dateResults.map(r => r.date) });
            });
        });
    });

    return router;
}
