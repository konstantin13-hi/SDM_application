// routes/attendanceRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {

    // Endpoint do dodawania obecności z zapobieganiem duplikatów
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

            // Inicjalizacja tablic do przechowywania dodanych i pominiętych rekordów
            const addedRecords = [];
            const skippedRecords = [];

            // Funkcja do sprawdzania i dodawania obecności bez duplikatów
            const addAttendance = (index) => {
                if (index >= attendanceRecords.length) {
                    // Wszystkie rekordy zostały przetworzone, wysyłamy odpowiedź
                    return res.json({
                        message: 'Attendance processed.',
                        addedRecords,
                        skippedRecords
                    });
                }

                const { studentId, status } = attendanceRecords[index];
                const checkAttendanceQuery = `SELECT * FROM attendance WHERE course_id = ? AND student_id = ? AND date = ?`;
                db.query(checkAttendanceQuery, [courseId, studentId, date], (err, attendanceResults) => {
                    if (err) {
                        console.error('Error checking attendance:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    if (attendanceResults.length > 0) {
                        // Jeśli rekord już istnieje, dodajemy do skippedRecords
                        // Pobieramy imię i nazwisko studenta
                        const getStudentQuery = `SELECT name, surname FROM students WHERE id = ?`;
                        db.query(getStudentQuery, [studentId], (err, studentResults) => {
                            if (err) {
                                console.error('Error fetching student data:', err);
                                return res.status(500).json({ message: 'Server error' });
                            }

                            if (studentResults.length > 0) {
                                const student = studentResults[0];
                                skippedRecords.push({ 
                                    studentId, 
                                    name: student.name, 
                                    surname: student.surname, 
                                    status 
                                });
                            } else {
                                skippedRecords.push({ 
                                    studentId, 
                                    name: 'Unknown', 
                                    surname: 'Unknown', 
                                    status 
                                });
                            }
                            addAttendance(index + 1);
                        });
                    } else {
                        // Dodajemy nowy rekord
                        const insertQuery = `INSERT INTO attendance (course_id, student_id, date, status) VALUES (?, ?, ?, ?)`;
                        db.query(insertQuery, [courseId, studentId, date, status], (err) => {
                            if (err) {
                                console.error('Error adding attendance:', err);
                                return res.status(500).json({ message: 'Server error' });
                            }
                            addedRecords.push({ studentId, status });
                            addAttendance(index + 1);
                        });
                    }
                });
            };

            // Rozpoczynamy proces dodawania obecności
            addAttendance(0);
        });
    });

    // Endpoint do pobierania obecności dla kursu i daty
    router.get('/attendance/course/:courseId/date/:date', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, date } = req.params;

        console.log('Fetching attendance for courseId:', courseId, 'date:', date); // Dodany log

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

                console.log('Attendance Results:', attendanceResults); // Dodany log
                res.json({ attendance: attendanceResults });
            });
        });
    });

    // Endpoint do pobierania dostępnych dat obecności dla kursu
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

            // Pobranie unikalnych dat obecności w formacie 'YYYY-MM-DD'
            const getDatesQuery = `
                SELECT DISTINCT DATE_FORMAT(date, '%Y-%m-%d') AS date
                FROM attendance
                WHERE course_id = ?
                ORDER BY date DESC
            `;
            db.query(getDatesQuery, [courseId], (err, dateResults) => {
                if (err) {
                    console.error('Error fetching attendance dates:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                // Mapowanie wyników do prostszej struktury
                const dates = dateResults.map(r => r.date);
                console.log('Available Dates:', dates); // Dodany log
                res.json({ dates });
            });
        });
    });

    return router;
}
