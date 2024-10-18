-- Создаем базу данных, если она не существует
CREATE DATABASE IF NOT EXISTS school;

-- Используем базу данных
USE school;

-- Создаем таблицу учителей
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE -- Добавляем уникальный email для учителей
);

-- Создаем таблицу курсов
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT NOT NULL,
    start_date DATE NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) -- Обновляем внешний ключ для связи с таблицей учителей
);

-- Создаем таблицу студентов
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Создаем таблицу посещаемости
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    present BOOLEAN NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Создаем таблицу оценок
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    grade DECIMAL(5, 2) NOT NULL,
    form_type VARCHAR(255) NOT NULL,
    weight DECIMAL(3, 2) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- NOWE
CREATE TABLE IF NOT EXISTS course_students (
    course_id INT,
    student_id INT,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

