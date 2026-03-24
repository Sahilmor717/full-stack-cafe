require('dotenv').config(); // Unlocks the .env vault

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { checkUser } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const adminRoutes = require('./routes/adminRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.set('socketio', io);

connectDB();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(checkUser);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/about', (req, res) => res.render('about'));
app.use(authRoutes);
app.use(shopRoutes);
app.use(adminRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});