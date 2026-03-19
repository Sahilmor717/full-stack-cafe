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

module.exports.admin_dashboard_get = async (req, res) => {
    if (res.locals.user.role !== 'admin') return res.redirect('/dashboard');
    
    const allOrders = await Order.find().populate('user').sort({ createdAt: -1 });
    
    const activeOrders = allOrders.filter(order => ['Pending', 'Accepted', 'Preparing'].includes(order.status));
    const pastOrders = allOrders.filter(order => ['Delivered', 'Cancelled', 'Completed'].includes(order.status));

    res.render('admindashboard', { activeOrders, pastOrders });
};

module.exports.admin_menu_get = async (req, res) => {
    if (res.locals.user.role !== 'admin') return res.redirect('/dashboard');
    const items = await Item.find();
    res.render('adminmenu', { items });
};

module.exports.add_item_post = async (req, res) => {
    const { name, description, price } = req.body;
    const imagePath = '/images/' + req.file.filename;
    
    await Item.create({ name, description, price, image: imagePath });
    res.redirect('/admin/menu'); 
};

module.exports.update_order_status_post = async (req, res) => {
    const { status } = req.body; 
    const orderId = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: status }, { returnDocument: 'after' });

    // SOCKET.IO: SHOUT TO USER
    const io = req.app.get('socketio');
    io.emit('orderStatusUpdated', { userId: updatedOrder.user.toString(), status: status });

    // NOTIFY THE USER VIA WEB PUSH
    const userSub = await Subscription.findOne({ userId: updatedOrder.user.toString() });
    if (userSub) {
        let emojis = { 'Accepted': '👍', 'Preparing': '👨‍🍳', 'Delivered': '✅', 'Cancelled': '❌', 'Pending': '⏳' };
        
        const payload = JSON.stringify({ 
            title: `Order Status Update ${emojis[status] || ''}`, 
            body: `Your order status has been updated to: ${status}.`
        });
        webpush.sendNotification(userSub.subscription, payload).catch(err => console.log("Push Error:", err));
    }

    res.redirect('/admin');
};

module.exports.toggle_stock_post = async (req, res) => {
    try {
        if (res.locals.user.role !== 'admin') return res.status(403).send("Unauthorized");
        
        const item = await Item.findById(req.params.id);
        if (item) {
            item.inStock = item.inStock === false ? true : false;
            await item.save();
        }
        res.redirect('/admin/menu');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/menu');
    }
};