CREATE DATABASE IF NOT EXISTS school;
USE school;

-- Таблица учителей
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Уникальный email для учителей
    password VARCHAR(255) NOT NULL -- Поле для хранения пароля
);

-- Таблица курсов
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT NOT NULL,
    start_date DATE NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Таблица студентов
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    teacher_id INT NOT NULL, -- Связь с таблицей учителей
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Таблица посещаемости
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL, -- Статусы посещаемости
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Таблица форм оценивания (например, тест, экзамен)
CREATE TABLE IF NOT EXISTS assessment_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    form_type VARCHAR(255) NOT NULL, -- Тип формы (например, тест, экзамен)
    weight DECIMAL(5, 2) NOT NULL, -- Вес формы
    date_created DATE DEFAULT (CURDATE()), -- Дата создания формы
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Таблица оценок студентов по каждой форме оценивания
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    assessment_form_id INT NOT NULL, -- Ссылка на форму оценивания
    grade DECIMAL(5, 2) NULL, -- Оценка студента
    date DATE NULL, -- Дата выставления оценки
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_form_id) REFERENCES assessment_forms(id) ON DELETE CASCADE
);

-- Таблица связи курсов и студентов
CREATE TABLE IF NOT EXISTS course_students (
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
