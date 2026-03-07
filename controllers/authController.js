const User = require('../models/userModel');
const AdminSession = require('../models/adminSessionModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d', // Consistent with requirement
    });
};

const setTokenCookie = (res, token, isAdmin = false) => {
    const cookieName = isAdmin ? 'adminToken' : 'token';
    const expires = isAdmin ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 24h for admin, 7d for user

    res.cookie(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: expires
    });
};

const registerUser = async (req, res) => {
    const { name, email, password, phone_number, whatsapp_number } = req.body;

    if (!phone_number) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isFirstUserAdmin = email === 'admin@tshirt.com';
    const finalWhatsappNumber = whatsapp_number || phone_number;

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        whatsapp_number: finalWhatsappNumber,
        role: isFirstUserAdmin ? 'admin' : 'user',
    });

    if (user) {
        const token = generateToken(user._id);
        setTokenCookie(res, token, user.role === 'admin');

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            whatsapp_number: user.whatsapp_number,
            role: user.role,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = generateToken(user._id);
        const isAdmin = user.role === 'admin';
        setTokenCookie(res, token, isAdmin);

        if (isAdmin) {
            await AdminSession.create({
                admin_id: user._id,
                ip_address: req.ip,
                user_agent: req.headers['user-agent'],
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            whatsapp_number: user.whatsapp_number,
            role: user.role,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const getUserProfile = async (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const logoutUser = async (req, res) => {
    // If admin, deactivate session
    if (req.cookies.adminToken) {
        try {
            const decoded = jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET || 'secret');
            await AdminSession.updateMany({ admin_id: decoded.id, is_active: true }, { is_active: false });
        } catch (e) {
            // Token might be expired, just continue
        }
    }

    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' });
    res.clearCookie('adminToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, logoutUser, getUserProfile };
