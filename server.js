<<<<<<< Updated upstream

=======
// server.js
>>>>>>> Stashed changes
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
import teacherRoutes from './routes/teacherRoutes.js';
import userRoutes from './routes/pagesRoutes/userRoutes.js';
import homePageRoute from "./routes/pagesRoutes/homePageRoute.js";
import addStudentRoutes from "./routes/studentsRoute.js";
import coursesRoute from "./routes/coursesRoute.js";
<<<<<<< Updated upstream


=======
import attendanceRoute from "./routes/attendanceRoute.js"; // Import nowego routera
>>>>>>> Stashed changes

const app = express();
const port = 3000;

<<<<<<< Updated upstream


app.use(cors({
    origin: 'http://localhost:5173'
}));


=======
app.use(cors({
    origin: 'http://localhost:5173' // Dostosuj, jeśli frontend działa na innym porcie lub domenie
}));

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
app.use(userRoutes(db));
app.use(teacherRoutes(db));
app.use(coursesRoute(db));
app.use(homePageRoute(db));
app.use(addStudentRoutes(db));
<<<<<<< Updated upstream




=======
app.use(attendanceRoute(db)); // Rejestracja nowego routera
>>>>>>> Stashed changes
