import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
<<<<<<< Updated upstream
    const token = req.header('Authorization')?.split(' ')[1]; // JWT может приходить как "Bearer token"

    if (!token) {
        window.location.href = 'loginPage.html';
=======
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // JWT może przychodzić jako "Bearer token"

    if (!token) {
>>>>>>> Stashed changes
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
<<<<<<< Updated upstream
        res.status(401).json({ message: 'wrong token' });
        window.location.href = 'loginPage.html';
=======
        return res.status(401).json({ message: 'Invalid token' });
>>>>>>> Stashed changes
    }
};

export default authMiddleware;
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
