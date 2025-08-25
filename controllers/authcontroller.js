const { validationResult } = require('express-validator');
const User = require('../models/user');
const { sendTokenRes } = require('../utils/auth');

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        const existUser = await User.findOne({ email });

        if (existUser) {
            return res.status(400).json({ message: "user already exist" })
        }

        const user = await User.create({
            name,
            email,
            password
        });

        sendTokenRes(user, 201, res);

    } catch (error) {
        res.status(500).json({ message: "Server error during registering", error: error.message })
    }

}

const login = async (req, res) => {

    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'User account is not active. Please contact support.'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        user.lastLogin = new Date();
        await user.save()

        sendTokenRes(user, 200, res);
    } catch (error) {

        console.error('Login error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });

    }

}

module.exports = { register, login };