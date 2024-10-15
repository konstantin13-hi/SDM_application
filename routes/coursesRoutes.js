// routes/coursesRoutes.js
import express from 'express';

const router = express.Router();

export default function(db) {
    // Trasa obsługująca żądanie GET na /courses
    router.get('/courses', (req, res) => {
        const query = `
          SELECT courses.name, teachers.name AS teacherName, courses.start_date 
          FROM courses 
          JOIN teachers ON courses.teacher_id = teachers.id
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching courses:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json(results);
        });
    });

    return router;
}
