const Settings = require('../models/settingsModel');
const NotificationLog = require('../models/notificationLogModel');
const twilio = require('twilio');

const getSettings = async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    res.json(settings);
};

const updateSettings = async (req, res) => {
    const { twilioSid, twilioAuthToken, whatsappSender, templates } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
        settings = new Settings();
    }

    settings.twilioSid = twilioSid || settings.twilioSid;
    settings.twilioAuthToken = twilioAuthToken || settings.twilioAuthToken;
    settings.whatsappSender = whatsappSender || settings.whatsappSender;

    if (templates) {
        settings.templates = { ...settings.templates, ...templates };
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
};

const getNotificationLogs = async (req, res) => {
    const logs = await NotificationLog.find({}).sort({ createdAt: -1 }).limit(50);
    res.json(logs);
};

const testWhatsappMessage = async (req, res) => {
    const { testNumber } = req.body;

    if (!testNumber) {
        return res.status(400).json({ message: "Test number is required" });
    }

    const settings = await Settings.findOne();
    if (!settings || !settings.twilioSid || !settings.twilioAuthToken || !settings.whatsappSender) {
        return res.status(400).json({ message: "Twilio credentials are not configured" });
    }

    try {
        const client = twilio(settings.twilioSid, settings.twilioAuthToken);
        const toFormat = `whatsapp:+91${testNumber}`;
        const fromFormat = `whatsapp:${settings.whatsappSender}`;

        await client.messages.create({
            body: "🚀 This is a test message from your T-Shirt customization web app admin panel!",
            from: fromFormat,
            to: toFormat
        });

        res.json({ message: "Test message sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send test message", error: error.message });
    }
};

module.exports = { getSettings, updateSettings, getNotificationLogs, testWhatsappMessage };
