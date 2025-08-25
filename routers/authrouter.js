const express = require('express');
const {body} = require ('express-validator');
const { register, login, getMe, logout } = require('../controllers/authcontroller');
const { protect } = require('../middlewares/auth');


const Authrouter = express.Router();

const registrationValidation = [
    body('name').notEmpty().withMessage('Name is Required'),
    body('email').isEmail().withMessage('kindly provide a Valid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user']).withMessage('Invalid role')
]

const loginValidation = [
    body('email').isEmail().withMessage('kindly provide a Valid Email'),
    body('password').notEmpty().withMessage('Password is required'),
]

Authrouter.post('/register',registrationValidation,register);
Authrouter.post('/login',loginValidation,login);
Authrouter.get('/me',protect,getMe);
Authrouter.get('/logout',protect,logout)


module.exports = Authrouter;