import express from 'express';
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

export default function(db) {
    router.get('/home', authMiddleware, (req, res) => {
        res.json({ message: `Welcome to HomePage, ${req.user.email} ` });

    });
    return router;
}
