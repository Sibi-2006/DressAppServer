const express = require('express');
const router = express.Router();
const { getAdminAnalytics, sendManualWhatsApp, downloadImageProxy, downloadZip } = require('../controllers/orderController');
const { getSettings, updateSettings, getNotificationLogs, testWhatsappMessage, getToastMessageSettings, updateToastMessageSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/analytics').get(protect, admin, getAdminAnalytics);
router.route('/download-image').get(protect, admin, downloadImageProxy);
router.route('/download-zip/:id').get(protect, admin, downloadZip);
router.route('/settings').get(protect, admin, getSettings).put(protect, admin, updateSettings);
router.route('/settings/notifications').get(protect, admin, getNotificationLogs);
router.route('/settings/test-whatsapp').post(protect, admin, testWhatsappMessage);
router.route('/orders/:id/whatsapp').post(protect, admin, sendManualWhatsApp);
router.route('/toast-message').get(protect, admin, getToastMessageSettings).patch(protect, admin, updateToastMessageSettings);

module.exports = router;
