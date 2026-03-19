const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const createToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });
};

module.exports.signup_get = (req, res) => res.render('signup');

module.exports.signup_post = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.send("User already exists");
        await User.create({ name, email, password });
        res.redirect('/login');
    } catch (err) { res.status(400).send("Error creating user"); }
};

module.exports.login_get = (req, res) => res.render('login');

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    
    if (email === "morsahil652@gmail.com" && password === "123") {
        const token = createToken('admin', 'admin');
        res.cookie('token', token, { httpOnly: true });
        return res.redirect('/admin');
    }

    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.send("Invalid credentials");
        
        const token = createToken(user._id, 'customer');
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (err) { res.status(400).send("Login error"); }
};

module.exports.logout_get = (req, res) => {
    res.cookie('token', '', { maxAge: 1 });
    res.redirect('/login');
};