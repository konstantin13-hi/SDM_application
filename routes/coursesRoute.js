<<<<<<< Updated upstream
=======
// routes/coursesRoute.js
>>>>>>> Stashed changes
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {
<<<<<<< Updated upstream
    router.post('/courses', (req, res) => {
        const { courseName, teacher, students, startDate } = req.body;
    
        if (!courseName || !teacher || !students || !startDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        const courseQuery = 'INSERT INTO courses (name, teacher_id, start_date) VALUES (?, ?, ?)';
        
        db.query(courseQuery, [courseName, teacher, startDate], (err, results) => {
=======
    // Endpoint do dodawania kursów z autoryzacją
    router.post('/courses', authMiddleware, (req, res) => {
        const { courseName, students, startDate } = req.body;
        const teacherId = req.user.id; // Pobieranie ID nauczyciela z tokenu

        if (!courseName || !students || !startDate) {
            return res.status(400).json({ message: 'All fields except teacher are required' });
        }

        const courseQuery = 'INSERT INTO courses (name, teacher_id, start_date) VALUES (?, ?, ?)';
        
        db.query(courseQuery, [courseName, teacherId, startDate], (err, results) => {
>>>>>>> Stashed changes
            if (err) {
                console.error('Error adding course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
<<<<<<< Updated upstream
    
            const courseId = results.insertId;
    
            const studentValues = students.map(studentId => [courseId, studentId]);
            const studentQuery = 'INSERT INTO course_students (course_id, student_id) VALUES ?';
    
=======

            const courseId = results.insertId;

            if (students.length === 0) {
                return res.json({ message: 'Course successfully added!', courseId });
            }

            const studentValues = students.map(studentId => [courseId, studentId]);
            const studentQuery = 'INSERT INTO course_students (course_id, student_id) VALUES ?';

>>>>>>> Stashed changes
            db.query(studentQuery, [studentValues], (err) => {
                if (err) {
                    console.error('Error adding students to course:', err);
                    return res.status(500).json({ message: 'Server error' });
                }
<<<<<<< Updated upstream
    
                res.json({ message: 'Course successfully added!' });
=======

                res.json({ message: 'Course successfully added!', courseId });
>>>>>>> Stashed changes
            });
        });
    });

<<<<<<< Updated upstream
    router.get('/my-courses',authMiddleware, (req, res) => {  // Убедитесь, что это '/'
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.id; // Получаем ID пользователя из токена

        const query = `
            SELECT courses.name, courses.start_date 
            FROM courses 
            WHERE teacher_id = ?
=======
    // Endpoint do pobierania kursów zalogowanego nauczyciela
    router.get('/my-courses', authMiddleware, (req, res) => {  
        const userId = req.user.id; // Pobieranie ID użytkownika z tokenu

        const query = `
            SELECT courses.id, courses.name, courses.start_date 
            FROM courses 
            WHERE teacher_id = ?
            ORDER BY courses.start_date DESC
>>>>>>> Stashed changes
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ courses: results });
        });
    });
<<<<<<< Updated upstream



=======
      // Endpoint do pobierania uczniów przypisanych do konkretnego kursu
    router.get('/courses/:courseId/students', authMiddleware, (req, res) => {
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

            // Pobranie uczniów przypisanych do kursu
            const getStudentsQuery = `
                SELECT s.id, s.name, s.surname
                FROM students s
                JOIN course_students cs ON s.id = cs.student_id
                WHERE cs.course_id = ?
            `;
            db.query(getStudentsQuery, [courseId], (err, studentResults) => {
                if (err) {
                    console.error('Error fetching students:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ students: studentResults });
            });
        });
    });
>>>>>>> Stashed changes

    return router;
}
