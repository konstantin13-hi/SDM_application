import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // JWT может приходить как "Bearer token"

    if (!token) {
        window.location.href = 'loginPage.html';
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'wrong token' });
        window.location.href = 'loginPage.html';
    }
};

export default authMiddleware;

