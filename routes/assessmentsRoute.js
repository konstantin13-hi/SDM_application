import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {
    // Маршрут для получения всех форм оценивания для конкретного курса
    router.get('/get-assessments', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId } = req.query;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required.' });
        }

        // Проверка, что курс принадлежит учителю
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Получение всех форм оценивания для курса из таблицы `assessment_forms`
            const getAssessmentsQuery = `SELECT id, form_type, weight FROM assessment_forms WHERE course_id = ?`;
            db.query(getAssessmentsQuery, [courseId], (err, assessmentResults) => {
                if (err) {
                    console.error('Error fetching assessments:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ assessments: assessmentResults });
            });
        });
    });

    // Маршрут для добавления новой формы оценивания
    router.post('/add-assessment', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, form_type, weight } = req.body;

        if (!courseId || !form_type || !weight) {
            return res.status(400).json({ message: 'Course ID, form type, and weight are required.' });
        }

        // Проверка, что курс принадлежит учителю
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Проверка, чтобы общая сумма весов не превышала 100 перед добавлением
            const checkWeightSumQuery = `SELECT SUM(weight) AS totalWeight FROM assessment_forms WHERE course_id = ?`;
            db.query(checkWeightSumQuery, [courseId], (err, weightResult) => {
                if (err) {
                    console.error('Error checking total weight:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const totalWeight = weightResult[0].totalWeight || 0;
                if (totalWeight + weight > 100) {
                    return res.status(400).json({ message: 'Total weight of assessments cannot exceed 100%.' });
                }

                // Добавление новой формы оценивания в таблицу `assessment_forms`
                const insertAssessmentQuery = `
                    INSERT INTO assessment_forms (course_id, form_type, weight)
                    VALUES (?, ?, ?)`;
                db.query(insertAssessmentQuery, [courseId, form_type, weight], (err, result) => {
                    if (err) {
                        console.error('Error adding assessment:', err);
                        return res.status(500).json({ message: 'Failed to add assessment.' });
                    }

                    res.json({ message: 'Assessment added successfully', id: result.insertId });
                });
            });
        });
    });

    // Маршрут для обновления формы оценивания
    router.put('/update-assessment/:id', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const assessmentId = req.params.id;
        const { form_type, weight } = req.body;

        if (!form_type || !weight) {
            return res.status(400).json({ message: 'Form type and weight are required.' });
        }

        // Проверка, что оценивание принадлежит учителю через его курс
        const checkAssessmentQuery = `
            SELECT course_id FROM assessment_forms 
            WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE teacher_id = ?)`;
        db.query(checkAssessmentQuery, [assessmentId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking assessment:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this assessment.' });
            }

            const courseId = results[0].course_id;

            // Проверка общей суммы весов, исключая текущую форму
            const checkWeightSumQuery = `
                SELECT SUM(weight) AS totalWeight FROM assessment_forms 
                WHERE course_id = ? AND id != ?`;
            db.query(checkWeightSumQuery, [courseId, assessmentId], (err, weightResult) => {
                if (err) {
                    console.error('Error checking total weight:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const totalWeight = weightResult[0].totalWeight || 0;
                if (totalWeight + weight > 100) {
                    return res.status(400).json({ message: 'Total weight of assessments cannot exceed 100%.' });
                }

                // Обновление формы оценивания
                const updateAssessmentQuery = `
                    UPDATE assessment_forms SET form_type = ?, weight = ? WHERE id = ?`;
                db.query(updateAssessmentQuery, [form_type, weight, assessmentId], (err) => {
                    if (err) {
                        console.error('Error updating assessment:', err);
                        return res.status(500).json({ message: 'Failed to update assessment.' });
                    }

                    res.json({ message: 'Assessment updated successfully' });
                });
            });
        });
    });

    // Маршрут для получения общей суммы весов для проверки на фронтенде
    router.get('/get-total-weight', authMiddleware, (req, res) => {
        const { courseId, assessmentId } = req.query;
        const query = `
            SELECT SUM(weight) AS totalWeight FROM assessment_forms 
            WHERE course_id = ? ${assessmentId ? 'AND id != ?' : ''}`;
        const params = assessmentId ? [courseId, assessmentId] : [courseId];

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Error checking total weight:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.json({ totalWeight: result[0].totalWeight || 0 });
        });
    });

    // Маршрут для удаления формы оценивания
    router.delete('/delete-assessment/:id', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const assessmentId = req.params.id;

        // Проверка прав доступа
        const checkAssessmentQuery = `
            SELECT * FROM assessment_forms 
            WHERE id = ? AND course_id IN (SELECT id FROM courses WHERE teacher_id = ?)`;
        db.query(checkAssessmentQuery, [assessmentId, teacherId], (err, results) => {
            if (err) {
                console.error('Error checking assessment:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this assessment.' });
            }

            // Удаление формы оценивания
            const deleteAssessmentQuery = `DELETE FROM assessment_forms WHERE id = ?`;
            db.query(deleteAssessmentQuery, [assessmentId], (err) => {
                if (err) {
                    console.error('Error deleting assessment:', err);
                    return res.status(500).json({ message: 'Failed to delete assessment.' });
                }

                res.json({ message: 'Assessment deleted successfully' });
            });
        });
    });

    return router;
}

