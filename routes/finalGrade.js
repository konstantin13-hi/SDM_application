// routes/coursesRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function (db) {
    // Получение итоговой оценки студентов по курсу
    router.get('/grades/course/:courseId/final-grades', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId } = req.params;

        // Проверка, принадлежит ли курс преподавателю
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, courseResults) => {
            if (err) return res.status(500).json({ message: 'Ошибка сервера при проверке курса', error: err });
            if (courseResults.length === 0) {
                return res.status(403).json({ message: 'Доступ запрещен: Вы не являетесь владельцем этого курса.' });
            }

            // Запрос для получения студентов и их финальных оценок
            const finalGradeQuery = `
            SELECT s.id AS student_id, s.name, s.surname,
                   SUM(g.grade * af.weight / 100) AS final_grade
            FROM students s
            JOIN course_students cs ON s.id = cs.student_id
            LEFT JOIN grades g ON s.id = g.student_id AND g.course_id = ?
            LEFT JOIN assessment_forms af ON g.assessment_form_id = af.id
            WHERE cs.course_id = ?
            GROUP BY s.id
        `;

            db.query(finalGradeQuery, [courseId, courseId], (err, results) => {
                if (err) return res.status(500).json({ message: 'Ошибка сервера при расчете итоговых оценок', error: err });
                res.json({ students: results });
            });
        });
    });


    return router;
}
