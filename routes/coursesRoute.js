// routes/coursesRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function (db) {
    // Добавление курса с авторизацией
    router.post('/courses', authMiddleware, (req, res) => {
        const { courseName, students, startDate } = req.body;
        const teacherId = req.user.id;

        if (!courseName || !students || !startDate) {
            return res.status(400).json({ message: 'All fields except teacher are required' });
        }

        const courseQuery = 'INSERT INTO courses (name, teacher_id, start_date) VALUES (?, ?, ?)';

        db.query(courseQuery, [courseName, teacherId, startDate], (err, results) => {
            if (err) {
                console.error('Error adding course:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const courseId = results.insertId;

            if (students.length === 0) {
                return res.json({ message: 'Course successfully added!', courseId });
            }

            const studentValues = students.map(studentId => [courseId, studentId]);
            const studentQuery = 'INSERT INTO course_students (course_id, student_id) VALUES ?';

            db.query(studentQuery, [studentValues], (err) => {
                if (err) {
                    console.error('Error adding students to course:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ message: 'Course successfully added!', courseId });
            });
        });
    });

    // Получение курсов авторизованного учителя
    router.get('/my-courses', authMiddleware, (req, res) => {
        const userId = req.user.id;

        const query = `
            SELECT courses.id, courses.name, courses.start_date 
            FROM courses 
            WHERE teacher_id = ?
            ORDER BY courses.start_date DESC
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ courses: results });
        });
    });

    // Получение студентов, прикрепленных к определенному курсу
    router.get('/courses/:courseId/students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId } = req.params;

        // Проверка, принадлежит ли курс учителю
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Получение студентов, прикрепленных к курсу
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

    router.delete('/delete-course/:id', authMiddleware, (req, res) => {
        
        const courseId = req.params.id;
        const teacherId = req.user.id;
        
        console.log("Attempting to delete course with ID:", courseId, "for teacher ID:", teacherId);

        const query = `DELETE FROM courses WHERE id = ? AND teacher_id = ?`;

        console.log("Request received to delete course with ID:", req.params.id);

        db.query(query, [courseId, teacherId], (err, results) => {
          if (err) {
            console.error('Error deleting course:', err);
            return res.status(500).json({ message: 'Server error' });
          }
          if (results.affectedRows === 0) {
            console.log('No course found or does not belong to teacher.');
            return res.status(404).json({ message: 'Course not found or does not belong to you.' });
          }
          res.json({ message: 'Course successfully deleted!' });
        });
      });
    


    return router;
}
