<<<<<<< Updated upstream
-- Создаем базу данных, если она не существует
CREATE DATABASE IF NOT EXISTS school;

-- Используем базу данных
USE school;

-- Создаем таблицу учителей
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Уникальный email для учителей
    password VARCHAR(255) NOT NULL -- Поле для хранения пароля
);

-- Создаем таблицу курсов
=======
-- 1. Tworzenie bazy danych, jeśli nie istnieje
CREATE DATABASE IF NOT EXISTS school;
USE school;

-- 2. Tworzenie tabeli nauczycieli
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Unikalny email dla nauczycieli
    password VARCHAR(255) NOT NULL -- Pole do przechowywania hasła
);

-- 3. Tworzenie tabeli kursów
>>>>>>> Stashed changes
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id INT NOT NULL,
    start_date DATE NOT NULL,
<<<<<<< Updated upstream
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) -- Внешний ключ на учителей
);

-- Создаем таблицу студентов с добавлением внешнего ключа на учителей
=======
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- 4. Tworzenie tabeli studentów
>>>>>>> Stashed changes
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
<<<<<<< Updated upstream
    teacher_id INT NOT NULL, -- Связь с таблицей учителей
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Создаем таблицу посещаемости
=======
    teacher_id INT NOT NULL, -- Powiązanie z tabelą nauczycieli
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- 5. Tworzenie tabeli obecności
>>>>>>> Stashed changes
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
<<<<<<< Updated upstream
    present BOOLEAN NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Создаем таблицу оценок
=======
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 6. Tworzenie tabeli ocen
>>>>>>> Stashed changes
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    grade DECIMAL(5, 2) NOT NULL,
    form_type VARCHAR(255) NOT NULL,
    weight DECIMAL(3, 2) NOT NULL,
    date DATE NOT NULL,
<<<<<<< Updated upstream
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Создаем таблицу связи курсов и студентов
CREATE TABLE IF NOT EXISTS course_students (
    course_id INT,
    student_id INT,
=======
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Tworzenie tabeli powiązań kursów i studentów
CREATE TABLE IF NOT EXISTS course_students (
    course_id INT NOT NULL,
    student_id INT NOT NULL,
>>>>>>> Stashed changes
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
