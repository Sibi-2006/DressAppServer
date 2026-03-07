const twilio = require('twilio');
const Settings = require('../models/settingsModel');
const NotificationLog = require('../models/notificationLogModel');

const sendWhatsAppMessage = async (clientName, phoneNumber, whatsappNumber, orderId, status, customMessage = null) => {
    try {
        const targetNumber = whatsappNumber || phoneNumber;

        if (!targetNumber) {
            console.warn(`[WhatsApp] Skipping message for Order #${orderId}: No phone/WhatsApp number available.`);
            return;
        }

        const settings = await Settings.findOne();
        if (!settings || !settings.twilioSid || !settings.twilioAuthToken || !settings.whatsappSender) {
            console.warn(`[WhatsApp] Skipping message for Order #${orderId}: Twilio globally disabled or unconfigured.`);
            return;
        }

        let messageText = customMessage;

        if (!messageText) {
            const template = settings.templates[status];
            if (!template) {
                console.warn(`[WhatsApp] Configuration skip: No template exists for status ${status}`);
                return;
            }
            messageText = template.replace('[Client Name]', clientName).replace('[Order ID]', orderId);
        }

        const client = twilio(settings.twilioSid, settings.twilioAuthToken);
        const toFormat = `whatsapp:+91${targetNumber}`;
        const fromFormat = `whatsapp:${settings.whatsappSender}`;

        const response = await client.messages.create({
            body: messageText,
            from: fromFormat,
            to: toFormat
        });

        // Log success
        await NotificationLog.create({
            clientName,
            phone: targetNumber,
            statusSent: status,
            result: 'Sent'
        });

    } catch (error) {
        console.error(`[WhatsApp API Error] Failed to send to ${whatsappNumber || phoneNumber}: ${error.message}`);

        await NotificationLog.create({
            clientName,
            phone: whatsappNumber || phoneNumber || 'Unknown',
            statusSent: status,
            result: 'Failed',
            errorMessage: error.message
        });
    }
};

module.exports = { sendWhatsAppMessage };
