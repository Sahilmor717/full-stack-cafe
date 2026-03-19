const Item = require('../models/Item');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const webpush = require('web-push');

// Grab keys dynamically from .env
webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

module.exports.home_get = (req, res) => {
    if (res.locals.user && res.locals.user.role === 'admin') {
        return res.redirect('/admin');
    }
    res.redirect('/dashboard');
};

module.exports.dashboard_get = async (req, res) => {
    if (res.locals.user && res.locals.user.role === 'admin') {
        return res.redirect('/admin');
    }
    const items = await Item.find();
    res.render('userdashboard', { items });
};

module.exports.checkout_get = (req, res) => {
    res.render('checkout');
};

module.exports.my_orders_get = async (req, res) => {
    try {
        const allOrders = await Order.find({ user: res.locals.user._id }).sort({ createdAt: -1 });

        const activeOrders = allOrders.filter(order => 
            ['Pending', 'Accepted', 'Preparing'].includes(order.status)
        );

        const pastOrders = allOrders.filter(order => 
            ['Delivered', 'Cancelled', 'Completed'].includes(order.status)
        );

        res.render('myorders', { activeOrders, pastOrders });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
};

module.exports.place_order_post = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        
        const newOrder = await Order.create({
            user: res.locals.user._id,
            items: items,
            totalAmount: totalAmount
        });

        // SOCKET.IO: SHOUT TO ADMIN
        const io = req.app.get('socketio');
        io.emit('newOrderPlaced', { message: 'New order arrived!' });

        // NOTIFY ADMIN VIA WEB PUSH
        const adminSub = await Subscription.findOne({ userId: 'admin' });
        if (adminSub) {
            const payload = JSON.stringify({ 
                title: 'New Order Received! 🍔', 
                body: `${res.locals.user.name} just placed an order for ₹${totalAmount}.`
            });
            webpush.sendNotification(adminSub.subscription, payload).catch(err => console.log("Push Error:", err));
        }
        
        res.json({ success: true });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ success: false }); 
    }
};