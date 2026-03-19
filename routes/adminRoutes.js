const { Router } = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const multer = require('multer');
const router = Router();

// Multer Config for Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- ADMIN ROUTES ---
router.get('/admin', requireAuth, adminController.admin_dashboard_get);
router.get('/admin/menu', requireAuth, adminController.admin_menu_get);

router.post('/admin/add-item', requireAuth, upload.single('image'), adminController.add_item_post);
router.post('/admin/update-order/:id', requireAuth, adminController.update_order_status_post);

// --- TOGGLE STOCK ROUTE ---
router.post('/admin/toggle-stock/:id', requireAuth, adminController.toggle_stock_post);

module.exports = router;