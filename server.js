
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';  // Nowy import

import coursesRoutes from './routes/coursesRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import addCourseRoutes from './routes/addCourseRoutes.js';


const app = express();
const port = 3000;


// Tworzymy odpowiedniki __dirname i __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ustawienie CORS
// app.use(cors());




app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello, this is your API!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        
    password: 'MyPa$$word1',  
    database: 'school'
});

db.connect((err) => {
    if (err) {
        console.error('Error :', err);
        return;
    }
    console.log('db connected');
});

// Serwowanie plików statycznych z katalogu "public"
app.use(express.static(path.join(__dirname, 'public')));

// Obsługa pliku courses.html spoza katalogu public
app.get('/courses', (req, res) => {
    // Zakładamy, że courses.html znajduje się w katalogu głównym projektu
    res.sendFile(path.join(__dirname, 'courses.html'));  // tutaj wskazujemy na katalog główny
});

app.use(teacherRoutes(db));
app.use(addCourseRoutes(db));



