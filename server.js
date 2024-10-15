import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';  // Nowy import

import coursesRoutes from './routes/coursesRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';

const app = express();
const port = 3000;

// Tworzymy odpowiedniki __dirname i __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ustawienie CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Połączenie z bazą danych
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MyPa$$word1',
    database: 'school'
});

// Sprawdzenie połączenia z bazą danych
db.connect((err) => {
    if (err) {
        console.error('Błąd połączenia z bazą danych:', err);
        return;
    }
    console.log('Połączono z bazą danych.');
});

// Serwowanie plików statycznych z katalogu "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rejestrowanie tras
app.use(coursesRoutes(db));  // Trasy kursów
app.use(teacherRoutes(db));  // Trasy nauczycieli

// Obsługa pliku courses.html spoza katalogu public
app.get('/courses', (req, res) => {
    // Zakładamy, że courses.html znajduje się w katalogu głównym projektu
    res.sendFile(path.join(__dirname, 'courses.html'));  // tutaj wskazujemy na katalog główny
});

// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});