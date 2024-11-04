// seedDatabase.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';  // Подключаем bcrypt для хэширования паролей

async function seedDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root', // Замените на вашего пользователя MySQL
        password: 'MyPa$$word1', // Замените на ваш пароль MySQL
        database: 'school', // Используем базу данных, которую вы создали
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

        // Вставляем данные в таблицу посещаемости с использованием поля 'status'
        await connection.query(`
            INSERT INTO attendance (course_id, student_id, date, status) VALUES
            (1, 1, '2023-10-05', 'present'),
            (1, 2, '2023-10-05', 'absent'),
            (2, 1, '2023-11-10', 'present'),
            (2, 3, '2023-11-10', 'present');
        `);

        // Вставляем данные в таблицу оценок
        await connection.query(`
            INSERT INTO grades (course_id, student_id, grade, form_type, weight, date) VALUES
            (1, 1, 85.5, 'Homework', 0.2, '2023-10-10'),
            (1, 2, 90.0, 'Exam', 0.5, '2023-10-15'),
            (2, 1, 75.0, 'Project', 0.3, '2023-11-15'),
            (3, 3, 88.5, 'Exam', 0.5, '2023-12-20');
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
