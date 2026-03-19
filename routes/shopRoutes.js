const { Router } = require('express');
const shopController = require('../controllers/shopController');
const { requireAuth } = require('../middleware/authMiddleware');
const Subscription = require('../models/Subscription');
const router = Router();

// --- PUBLIC ROUTES ---
router.get('/', shopController.home_get);
router.get('/dashboard', shopController.dashboard_get);
router.get('/checkout', shopController.checkout_get);

// --- PROTECTED ROUTES ---
router.get('/my-orders', requireAuth, shopController.my_orders_get);
router.post('/place-order', requireAuth, shopController.place_order_post);

// --- PUSH NOTIFICATION ROUTE ---
router.post('/subscribe', requireAuth, async (req, res) => {
    const subscription = req.body;
    const userId = res.locals.user.role === 'admin' ? 'admin' : res.locals.user._id.toString();

    // Save or update the device for this user (Mongoose warning fixed here)
    await Subscription.findOneAndUpdate(
        { userId: userId }, 
        { subscription: subscription }, 
        { upsert: true, returnDocument: 'after' } 
    );
    res.status(201).json({});
});

module.exports = router;