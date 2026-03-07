const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AdminSession = require('../models/adminSessionModel');

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies (preferred) or headers
    if (req.cookies.token || req.cookies.adminToken) {
        token = req.cookies.token || req.cookies.adminToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        return next();
    } catch (error) {
        // If token failed, clear the cookie if it exists
        res.clearCookie('token');
        res.clearCookie('adminToken');
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const admin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        const session = await AdminSession.findOne({
            admin_id: req.user._id,
            is_active: true,
            expires_at: { $gt: new Date() }
        });

        if (session) {
            next();
        } else {
            res.clearCookie('adminToken');
            res.status(401).json({ message: 'Session expired or invalid, please login again' });
        }
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
