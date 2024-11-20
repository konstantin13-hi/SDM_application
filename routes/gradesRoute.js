import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {

    // Endpoint для получения списка студентов с оценками по форме оценивания
    router.get('/grades/course/:courseId/assessment-form/:assessmentFormId/students', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, assessmentFormId } = req.params;

        // Проверка принадлежности курса преподавателю
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, courseResults) => {
            if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
            if (courseResults.length === 0) {
                return res.status(403).json({ message: 'Доступ запрещен: Вы не являетесь владельцем этого курса.' });
            }

            // Запрос на получение всех студентов и их оценок по указанной форме
            const getStudentsWithGradesQuery = `
                SELECT s.id AS student_id, s.name, s.surname, g.id AS grade_id, g.date, g.grade
                FROM students s
                JOIN course_students cs ON s.id = cs.student_id
                LEFT JOIN grades g ON s.id = g.student_id AND g.course_id = ? AND g.assessment_form_id = ?
                WHERE cs.course_id = ?
                ORDER BY s.name ASC, s.surname ASC
            `;
            db.query(getStudentsWithGradesQuery, [courseId, assessmentFormId, courseId], (err, results) => {
                if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
                res.json({ students: results });
            });
        });
    });

    // Endpoint для обновления оценки студента по форме
    router.put('/grades/update-grade', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { gradeId, studentId, gradeDate, gradeValue } = req.body;

        if (!studentId || gradeValue === undefined) {
            return res.status(400).json({ message: 'Идентификатор студента и оценка обязательны.' });
        }

        const gradeNumber = parseFloat(gradeValue);
        if (isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 100) {
            return res.status(400).json({ message: 'Оценка должна быть числом от 1 до 100.' });
        }

        // Проверка, принадлежит ли оценка преподавателю курса
        const checkGradeQuery = `
            SELECT g.*, c.teacher_id 
            FROM grades g
            JOIN courses c ON g.course_id = c.id
            WHERE g.id = ?
        `;
        db.query(checkGradeQuery, [gradeId], (err, gradeResults) => {
            if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
            if (gradeResults.length === 0) return res.status(404).json({ message: 'Оценка не найдена.' });

            const grade = gradeResults[0];
            if (grade.teacher_id !== teacherId) {
                return res.status(403).json({ message: 'Доступ запрещен: Вы не являетесь владельцем этого курса.' });
            }

            const updateGradeQuery = `UPDATE grades SET date = ?, grade = ? WHERE id = ?`;
            db.query(updateGradeQuery, [gradeDate || null, gradeNumber, gradeId], (err) => {
                if (err) return res.status(500).json({ message: 'Ошибка сервера', error: err });
                res.json({ message: 'Grade updated successfully.' });
            });
        });
    });

    // Endpoint для обновления формы оценивания (типа и веса формы)
    router.put('/grades/update-assessment', authMiddleware, (req, res) => {
        const { id, form_type, weight } = req.body;

        if (!id || !form_type || weight === undefined) {
            return res.status(400).json({ message: 'Идентификатор, тип формы и вес обязательны.' });
        }

        const updateAssessmentQuery = `UPDATE assessment_forms SET form_type = ?, weight = ? WHERE id = ?`;
        db.query(updateAssessmentQuery, [form_type, weight, id], (err) => {
            if (err) return res.status(500).json({ message: 'Ошибка при обновлении формы.', error: err });
            res.json({ message: 'Grade updated successfully.' });
        });
    });

    // Endpoint для добавления новой оценки студенту по форме
    router.post('/grades/add-grade', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { studentId, gradeDate, gradeValue, assessmentFormId, courseId } = req.body;

        if (!studentId || gradeValue === undefined || !gradeDate || !assessmentFormId || !courseId) {
            return res.status(400).json({ message: 'Все поля обязательны: studentId, gradeDate, gradeValue, assessmentFormId, courseId.' });
        }

        const gradeNumber = parseFloat(gradeValue);
        if (isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 100) {
            return res.status(400).json({ message: 'Оценка должна быть числом от 1 до 100.' });
        }

        // Проверка, принадлежит ли курс преподавателю
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, courseResults) => {
            if (err) return res.status(500).json({ message: 'Ошибка сервера при проверке курса', error: err });
            if (courseResults.length === 0) {
                return res.status(403).json({ message: 'Доступ запрещен: Вы не являетесь владельцем этого курса.' });
            }

            // Проверка, существует ли уже оценка для данного студента по этой форме
            const checkExistingGradeQuery = `
            SELECT * FROM grades WHERE student_id = ? AND assessment_form_id = ? AND course_id = ?
        `;
            db.query(checkExistingGradeQuery, [studentId, assessmentFormId, courseId], (err, results) => {
                if (err) return res.status(500).json({ message: 'Ошибка сервера при проверке существующих оценок', error: err });

                if (results.length > 0) {
                    return res.status(400).json({ message: 'Оценка для этого студента уже существует.' });
                }

                // Добавляем новую оценку
                const insertGradeQuery = `
                INSERT INTO grades (student_id, date, grade, assessment_form_id, course_id) 
                VALUES (?, ?, ?, ?, ?)
            `;
                db.query(insertGradeQuery, [studentId, gradeDate, gradeNumber, assessmentFormId, courseId], (err, result) => {
                    if (err) return res.status(500).json({ message: 'Ошибка сервера при добавлении оценки', error: err });

                    res.status(201).json({ message: 'Оценка успешно добавлена.' });
                });
            });
        });
    });



    return router;
}
