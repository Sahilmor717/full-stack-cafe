const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = "sahilsupersecretkey123";

const checkUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.locals.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role === 'admin') {
            res.locals.user = { name: 'Admin', role: 'admin' };
            return next();
        }

        const user = await User.findById(decoded.id).select('-password');
        res.locals.user = user;
        next();
    } catch (error) {
        res.locals.user = null;
        next();
    }
};

const requireAuth = (req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
};

module.exports = { checkUser, requireAuth, JWT_SECRET };