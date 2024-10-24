import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {
    // Обработчик для получения курсов текущего пользователя
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
