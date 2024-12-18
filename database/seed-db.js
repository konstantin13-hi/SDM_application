import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';  // Подключаем bcrypt для хэширования паролей

async function seedDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'MyPa$$word1',
        database: 'school',
        multipleStatements: true
    });

    try {
        console.log('Подключение к базе данных успешно установлено.');

        // Хэшируем пароли для учителей
        const hashedPassword1 = await bcrypt.hash('password123', 10);
        const hashedPassword2 = await bcrypt.hash('password456', 10);
        const hashedPassword3 = await bcrypt.hash('password789', 10);

        // Вставляем данные в таблицу учителей с хэшированными паролями
        await connection.query(`
            INSERT INTO teachers (name, email, password) VALUES
            ('John Smith', 'john.smith@example.com', '${hashedPassword1}'),
            ('Alice Johnson', 'alice.johnson@example.com', '${hashedPassword2}'),
            ('Bob Brown', 'bob.brown@example.com', '${hashedPassword3}');
        `);

        // Вставляем данные в таблицу курсов
        await connection.query(`
            INSERT INTO courses (name, teacher_id, start_date) VALUES
            ('Math 101', 1, '2023-10-01'),
            ('History 101', 2, '2023-11-01'),
            ('Science 101', 3, '2023-12-01');
        `);

        // Вставляем данные в таблицу студентов
        await connection.query(`
            INSERT INTO students (name, surname, teacher_id) VALUES
            ('Charlie', 'Doe', 1),
            ('Emily', 'Green', 1),
            ('David', 'White', 1);
        `);

        // Вставляем данные в таблицу посещаемости
        await connection.query(`
            INSERT INTO attendance (course_id, student_id, date, status) VALUES
            (1, 1, '2023-10-05', 'present'),
            (1, 2, '2023-10-05', 'absent'),
            (2, 1, '2023-11-10', 'present'),
            (2, 3, '2023-11-10', 'present');
        `);

        // Вставляем данные в таблицу форм оценивания
        await connection.query(`
            INSERT INTO assessment_forms (course_id, form_type, weight) VALUES
            (1, 'Homework', 0.2),
            (1, 'Exam', 0.5),
            (2, 'Project', 0.3),
            (3, 'Exam', 0.5);
        `);

        // Вставляем данные в таблицу оценок, используя assessment_form_id
        await connection.query(`
            INSERT INTO grades (course_id, student_id, assessment_form_id, grade, date) VALUES
            (1, 1, 1, 85.5, '2023-10-10'),  -- Homework for Charlie
            (1, 2, 2, 90.0, '2023-10-15'),  -- Exam for Emily
            (2, 1, 3, 75.0, '2023-11-15'),  -- Project for Charlie
            (3, 3, 4, 88.5, '2023-12-20');  -- Exam for David
        `);

        // Вставляем данные в таблицу course_students для регистрации студентов на курсы
        await connection.query(`
            INSERT INTO course_students (course_id, student_id) VALUES
            (1, 1),
            (1, 2),
            (2, 1),
            (2, 3),
            (3, 3);
        `);

        console.log('Данные успешно добавлены в базу данных.');
    } catch (error) {
        console.error('Ошибка при заполнении базы данных:', error);
    } finally {
        await connection.end();
        console.log('Подключение к базе данных закрыто.');
    }
}

seedDatabase();
