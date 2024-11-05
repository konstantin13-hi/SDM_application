// server.js
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import teacherRoutes from './routes/teacherRoutes.js';
import userRoutes from './routes/pagesRoutes/userRoutes.js';
import homePageRoute from "./routes/pagesRoutes/homePageRoute.js";
import addStudentRoutes from "./routes/studentsRoute.js";
import coursesRoute from "./routes/coursesRoute.js";
import attendanceRoute from "./routes/attendanceRoute.js";

const app = express();
const port = 3000;

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

app.use(userRoutes(db));
app.use(teacherRoutes(db));
app.use(coursesRoute(db));
app.use(homePageRoute(db));
app.use(addStudentRoutes(db));
app.use(attendanceRoute(db));
