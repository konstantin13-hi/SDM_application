
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import teacherRoutes from './routes/teacherRoutes.js';
import addCourseRoutes from './routes/addCourseRoutes.js';

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

app.use(teacherRoutes(db));
app.use(addCourseRoutes(db));


