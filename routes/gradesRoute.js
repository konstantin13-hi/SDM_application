// routes/gradesRoute.js
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {

    // Endpoint do dodawania oceny
    router.post('/add-assessment', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, form_type, weight, date } = req.body;

        // Walidacja danych wejściowych
        if (!courseId || !form_type || weight === undefined) {
            return res.status(400).json({ message: 'Course ID, form type, and weight are required.' });
        }

        // Walidacja, czy weight jest liczbą dodatnią i mieści się w zakresie 1-100
        const weightNumber = parseFloat(weight);
        if (isNaN(weightNumber) || weightNumber < 1 || weightNumber > 100) {
            return res.status(400).json({ message: 'Weight must be a number between 1 and 100.' });
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

            // Pobranie wszystkich studentów w kursie
            const getStudentsQuery = `SELECT student_id FROM course_students WHERE course_id = ?`;
            db.query(getStudentsQuery, [courseId], (err, studentResults) => {
                if (err) {
                    console.error('Error fetching students:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (studentResults.length === 0) {
                    return res.status(400).json({ message: 'No students found in this course.' });
                }

                const dateValue = date || null; // Ustawienie na NULL, jeśli nie dostarczono

                // Tworzenie wpisów w tabeli grades dla każdego studenta
                const insertGradePromises = studentResults.map(student => {
                    const studentId = student.student_id;
                    const insertQuery = `INSERT INTO grades (course_id, student_id, grade, form_type, weight) VALUES (?, ?, ?, ?, ?)`;
                    return new Promise((resolve, reject) => {
                        db.query(insertQuery, [courseId, studentId, null, form_type, weightNumber], (err) => { // grade set to NULL initially
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(insertGradePromises)
                .then(() => {
                    res.json({ message: 'Assessment added successfully.' });
                })
                .catch(error => {
                    console.error('Error adding assessment:', error);
                    res.status(500).json({ message: 'Failed to add assessment.' });
                });
            });
        });
    });

    // Endpoint do pobierania unikalnych typów ocen dla kursu


    // Endpoint do pobierania studentów przypisanych do kursu
    router.get('/course/:courseId/students', authMiddleware, (req, res) => {
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

            // Pobranie studentów przypisanych do kursu
            const getStudentsQuery = `
                SELECT s.id, s.name, s.surname
                FROM students s
                JOIN course_students cs ON s.id = cs.student_id
                WHERE cs.course_id = ?
                ORDER BY s.name ASC, s.surname ASC
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

    // Endpoint do pobierania ocen dla konkretnego studenta, kursu i typu oceny
    router.get('/student/:studentId/course/:courseId/assessment-type/:assessmentType', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { studentId, courseId, assessmentType } = req.params;

        // Sprawdzenie, czy kurs należy do nauczyciela
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, courseResults) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (courseResults.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Pobranie oceny
            const getGradeQuery = `
                SELECT * FROM grades
                WHERE course_id = ? AND student_id = ? AND form_type = ?
            `;
            db.query(getGradeQuery, [courseId, studentId, assessmentType], (err, gradeResults) => {
                if (err) {
                    console.error('Error fetching grade:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (gradeResults.length === 0) {
                    return res.status(404).json({ message: 'Grade not found.' });
                }

                res.json({ grade: gradeResults[0] });
            });
        });
    });

    // Endpoint do aktualizacji oceny
    router.put('/update-grade', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { gradeId, gradeDate, gradeValue } = req.body;

        // Walidacja danych wejściowych
        if (!gradeId || gradeValue === undefined) {
            return res.status(400).json({ message: 'Grade ID and grade value are required.' });
        }

        // Walidacja, czy gradeValue jest liczbą z zakresu 1-100
        const gradeNumber = parseFloat(gradeValue);
        if (isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 100) {
            return res.status(400).json({ message: 'Grade must be a number between 1 and 100.' });
        }

        // Sprawdzenie, czy ocena istnieje i należy do nauczyciela
        const checkGradeQuery = `
            SELECT g.*, c.teacher_id 
            FROM grades g
            JOIN courses c ON g.course_id = c.id
            WHERE g.id = ?
        `;
        db.query(checkGradeQuery, [gradeId], (err, gradeResults) => {
            if (err) {
                console.error('Error checking grade:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (gradeResults.length === 0) {
                return res.status(404).json({ message: 'Grade not found.' });
            }

            const grade = gradeResults[0];
            if (grade.teacher_id !== teacherId) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Aktualizacja oceny
            const gradeDateValue = gradeDate || null; // Ustawienie na NULL, jeśli nie dostarczono
            const updateGradeQuery = `UPDATE grades SET date = ?, grade = ? WHERE id = ?`;
            db.query(updateGradeQuery, [gradeDateValue, gradeNumber, gradeId], (err, updateResults) => {
                if (err) {
                    console.error('Error updating grade:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ message: 'Grade updated successfully.' });
            });
        });
    });

    // Endpoint do pobierania ocen dla konkretnego kursu i typu oceny
    router.get('/course/:courseId/assessment-type/:assessmentType', authMiddleware, (req, res) => {
        const teacherId = req.user.id;
        const { courseId, assessmentType } = req.params;

        // Sprawdzenie, czy kurs należy do nauczyciela
        const checkCourseQuery = `SELECT * FROM courses WHERE id = ? AND teacher_id = ?`;
        db.query(checkCourseQuery, [courseId, teacherId], (err, courseResults) => {
            if (err) {
                console.error('Error checking course:', err);
                return res.status(500).json({ message: 'Server error' });
            }
            if (courseResults.length === 0) {
                return res.status(403).json({ message: 'Forbidden: You do not own this course.' });
            }

            // Pobranie ocen
            const getGradesQuery = `
                SELECT g.id, g.student_id, s.name, s.surname, g.date, g.grade
                FROM grades g
                JOIN students s ON g.student_id = s.id
                WHERE g.course_id = ? AND g.form_type = ?
                ORDER BY s.name ASC, s.surname ASC
            `;
            db.query(getGradesQuery, [courseId, assessmentType], (err, gradeResults) => {
                if (err) {
                    console.error('Error fetching grades:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.json({ grades: gradeResults });
            });
        });
    });

    router.put('/grades/update-assessment', async (req, res) => {
        const { id, form_type, weight } = req.body;
        try {
            await db.query('UPDATE grades SET form_type = ?, weight = ? WHERE id = ?', [form_type, weight, id]);
            res.json({ success: true, message: 'Оценка обновлена.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Не удалось обновить оценку.' });
        }
    });


    return router;
}
