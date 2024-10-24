import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {
    router.post('/courses', (req, res) => {
        const { courseName, teacher, students, startDate } = req.body;
    
        if (!courseName || !teacher || !students || !startDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        const courseQuery = 'INSERT INTO courses (name, teacher_id, start_date) VALUES (?, ?, ?)';
        
        db.query(courseQuery, [courseName, teacher, startDate], (err, results) => {
            if (err) {
                console.error('Error adding course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
    
            const courseId = results.insertId;
    
            const studentValues = students.map(studentId => [courseId, studentId]);
            const studentQuery = 'INSERT INTO course_students (course_id, student_id) VALUES ?';
    
            db.query(studentQuery, [studentValues], (err) => {
                if (err) {
                    console.error('Error adding students to course:', err);
                    return res.status(500).json({ message: 'Server error' });
                }
    
                res.json({ message: 'Course successfully added!' });
            });
        });
    });

    router.get('/my-courses',authMiddleware, (req, res) => {  // Убедитесь, что это '/'
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.id; // Получаем ID пользователя из токена

        const query = `
            SELECT courses.name, courses.start_date 
            FROM courses 
            WHERE teacher_id = ?
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ courses: results });
        });
    });




    return router;
}
