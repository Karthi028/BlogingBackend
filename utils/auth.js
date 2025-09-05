const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES, NODE_ENV } = require('../utils/config')

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES
    });
};

const sendTokenRes = (user, statusCode, res) => {

    const token = generateToken(user.id);

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax"
    }

    user.password = undefined;

    res.status(statusCode).cookie("token", token, options).json({ success: true, token, user });

}
module.exports = { sendTokenRes, generateToken };

