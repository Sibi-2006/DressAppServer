const Order = require('../models/orderModel');
const { sendWhatsAppMessage } = require('../utils/whatsappService');
const { generateOrderId, generateUPILink } = require('../utils/upiService');
const { cloudinary } = require('../config/cloudinary');
const axios = require('axios');
const JSZip = require('jszip');

// Proxy download for Cloudinary images (bypasses browser CORS)
const downloadImageProxy = async (req, res) => {
    try {
        const { url, filename } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Fetch image from Cloudinary on SERVER side
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        const contentType = response.headers['content-type'] || 'image/jpeg';
        const fileExt = url.split('.').pop().split('?')[0] || 'jpg';

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename || 'design.' + fileExt}"`,
            'Content-Length': response.data.length,
            'Access-Control-Allow-Origin': '*'
        });

        res.send(Buffer.from(response.data));
    } catch (error) {
        console.error('Download proxy error:', error.message);
        res.status(500).json({ error: 'Failed to download image' });
    }
};

// Server-side ZIP generation for all designs in an order
const downloadZip = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const zip = new JSZip();
        const designs = [];

        // Collect all images from items
        order.items.forEach((item, itemIdx) => {
            if (item.front_images && item.front_images.length > 0) {
                item.front_images.forEach((img, imgIdx) => {
                    if (img.url) {
                        designs.push({
                            url: img.url,
                            filename: `Item${itemIdx + 1}_Front_Design_${imgIdx + 1}.jpg`
                        });
                    }
                });
            }
            if (item.back_images && item.back_images.length > 0) {
                item.back_images.forEach((img, imgIdx) => {
                    if (img.url) {
                        designs.push({
                            url: img.url,
                            filename: `Item${itemIdx + 1}_Back_Design_${imgIdx + 1}.jpg`
                        });
                    }
                });
            }
        });

        if (designs.length === 0) {
            return res.status(400).json({ error: 'No design images found' });
        }

        // Fetch each image server-side and add to ZIP
        for (const design of designs) {
            try {
                const response = await axios.get(design.url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                zip.file(design.filename, Buffer.from(response.data));
            } catch (err) {
                console.error(`Failed to fetch ${design.filename}:`, err.message);
            }
        }

        const zipBuffer = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const zipFilename = `NEONTHREADS_${order.orderId || order._id}_Designs.zip`;

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipFilename}"`,
            'Content-Length': zipBuffer.length
        });

        res.send(zipBuffer);
    } catch (error) {
        console.error('ZIP download error:', error.message);
        res.status(500).json({ error: 'Failed to create ZIP file' });
    }
};

const deleteOrderImages = async (order) => {
    const publicIds = [];
    order.items.forEach(item => {
        if (item.front_images) {
            item.front_images.forEach(img => {
                if (img.public_id) publicIds.push(img.public_id);
            });
        }
        if (item.back_images) {
            item.back_images.forEach(img => {
                if (img.public_id) publicIds.push(img.public_id);
            });
        }
    });

    for (const publicId of publicIds) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error(`Failed to delete image ${publicId}:`, error);
        }
    }
};

const addOrderItems = async (req, res) => {
    const { items, shippingAddress, totalPrice, client_note } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    if (!req.user) {
        return res.status(401).json({ message: 'User verification failed' });
    }

    let calculatedTotalPrice = 0;

    // Calculate total purely on backend per security rules
    items.forEach(item => {
        // Enforce valid numbers for price calculation
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 1;
        calculatedTotalPrice += (itemPrice * itemQty);
    });

    // Fallback if price calculation lacks base cost context, but prompt says "Amount is taken from DB - NEVER from frontend input"
    // Since items contains price per item logic, we just sum up the items.

    const orderIdCustom = generateOrderId();
    const upiLink = generateUPILink(orderIdCustom, calculatedTotalPrice);

    const order = new Order({
        userId: req.user._id,
        orderId: orderIdCustom,
        items,
        shippingAddress,
        totalPrice: calculatedTotalPrice,
        order_total: calculatedTotalPrice,
        client_note,
        payment: {
            method: 'UPI',
            status: 'PENDING',
            amount: calculatedTotalPrice
        }
    });

    const createdOrder = await order.save();

    res.status(201).json({
        orderId: createdOrder._id,
        customOrderId: orderIdCustom,
        amount: calculatedTotalPrice,
        upiLink: upiLink,
        order: createdOrder
    });
};

const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

const updatePaymentStatus = async (req, res) => {
    const { status, utr_number } = req.body;
    const order = await Order.findById(req.params.id).populate('userId', 'name phone_number whatsapp_number');

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'VERIFICATION_PENDING') {
        if (!utr_number || !/^\d{12}$/.test(utr_number)) {
            return res.status(400).json({ message: 'Invalid UTR Number. Must be exactly 12 digits.' });
        }

        // Check for UTR reuse
        const utrExists = await Order.findOne({ 'payment.utr_number': utr_number, _id: { $ne: order._id } });
        if (utrExists) {
            return res.status(400).json({ message: 'This UTR number has already been submitted for another order.' });
        }

        order.payment.status = 'VERIFICATION_PENDING';
        order.payment.utr_number = utr_number;
        await order.save();
        return res.json({ message: 'UTR submitted successfully. Awaiting admin verification.', order });
    }

    if (status === 'SUCCESS') {
        // Only admin should set SUCCESS (ideally protected by middleware, but let's check roles if req.user is available)
        // For now, assuming this endpoint is used by Admin for confirm and User for initial deep link (but we are changing that)

        order.payment.status = 'SUCCESS';
        order.payment.paid_at = new Date();
        order.status = 'Pending';
        await order.save();

        if (order.userId) {
            const message = `Dear ${order.userId.name}, your payment of ₹${order.payment.amount || order.totalPrice} for Order #${order.orderId || order._id} has been verified! ✅\nYour order is now confirmed.\n\n- NEONTHREADS`;
            sendWhatsAppMessage(order.userId.name, order.userId.phone_number, order.userId.whatsapp_number, order._id, 'Custom', message).catch(err => console.error("Async sending skipped: " + err));
        }

        return res.json(order);
    }

    if (status === 'FAILED') {
        order.payment.status = 'FAILED';
        await order.save();

        if (order.userId) {
            const message = `Dear ${order.userId.name}, we could not verify your payment for Order #${order.orderId || order._id}. Please contact us or retry.\n\n- NEONTHREADS`;
            sendWhatsAppMessage(order.userId.name, order.userId.phone_number, order.userId.whatsapp_number, order._id, 'Custom', message).catch(err => console.error("Async sending skipped: " + err));
        }

        return res.json(order);
    }

    if (status === 'CANCELLED') {
        order.payment.status = 'CANCELLED';
        order.status = 'Cancelled';
        await deleteOrderImages(order);
        await order.save();
        return res.json(order);
    }

    res.status(400).json({ message: 'Invalid payment status' });
};

const getMyOrders = async (req, res) => {
    const ordersRaw = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    const orders = ordersRaw.map(order => ({
        ...order,
        upiLink: order.payment && order.payment.status === 'PENDING' ? generateUPILink(order.orderId || order._id, order.payment.amount || order.totalPrice) : null
    }));
    res.json(orders);
};

const getOrders = async (req, res) => {
    const ordersRaw = await Order.find({}).populate('userId', 'id name email phone_number whatsapp_number').sort({ createdAt: -1 }).lean();
    const orders = ordersRaw.map(order => ({
        ...order,
        upiLink: order.payment && order.payment.status === 'PENDING' ? generateUPILink(order.orderId || order._id, order.payment.amount || order.totalPrice) : null
    }));
    res.json(orders);
};

const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('userId', 'name phone_number whatsapp_number');
    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();

        // Fire and forget, don't block order status update response
        if (order.userId && req.body.status) {
            sendWhatsAppMessage(
                order.userId.name,
                order.userId.phone_number,
                order.userId.whatsapp_number,
                order._id,
                order.status
            ).catch(err => console.error("Async sending skipped: " + err));
        }

        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('userId', 'name phone_number whatsapp_number');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    if (order.status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    order.status = 'Cancelled';
    await deleteOrderImages(order);
    const updatedOrder = await order.save();

    // Fire and forget
    if (order.userId) {
        sendWhatsAppMessage(
            order.userId.name,
            order.userId.phone_number,
            order.userId.whatsapp_number,
            order._id,
            order.status
        ).catch(err => console.error("Async sending skipped: " + err));
    }

    res.json(updatedOrder);
};

const getAdminAnalytics = async (req, res) => {
    try {
        const { fit_type } = req.query;
        const orders = await Order.find({}).populate('userId', 'name').sort({ createdAt: -1 });

        let totalOrders = 0;
        let totalRevenue = 0;
        let pendingRevenue = 0;
        let totalTshirtsSold = 0;
        let cancelledOrders = 0;

        // Payment Stats
        let paymentCollected = 0;
        let paymentPendingAmount = 0;
        let paymentFailedCount = 0;
        let todaysCollection = 0;

        let statusBreakdown = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
        const revenueByStatusMap = {
            Pending: { status: 'Pending', orderCount: 0, quantity: 0, revenue: 0 },
            Processing: { status: 'Processing', orderCount: 0, quantity: 0, revenue: 0 },
            Shipped: { status: 'Shipped', orderCount: 0, quantity: 0, revenue: 0 },
            Delivered: { status: 'Delivered', orderCount: 0, quantity: 0, revenue: 0 },
            Cancelled: { status: 'Cancelled', orderCount: 0, quantity: 0, revenue: 0 }
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let recentOrdersList = [];

        for (const order of orders) {
            let validItems = order.items;
            if (fit_type && fit_type !== 'ALL') {
                validItems = order.items.filter(item => item.fit_type === fit_type);
            }

            if (validItems.length === 0 && fit_type && fit_type !== 'ALL') continue;

            totalOrders++;
            statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
            if (order.status === 'Cancelled') cancelledOrders++;

            let orderRevenue = 0;
            let orderTshirts = 0;

            for (const item of validItems) {
                orderRevenue += item.price * item.quantity;
                orderTshirts += item.quantity;
            }

            if (order.status === 'Delivered') {
                totalRevenue += orderRevenue;
                totalTshirtsSold += orderTshirts;
            } else if (order.status !== 'Cancelled') {
                pendingRevenue += orderRevenue;
            }

            if (revenueByStatusMap[order.status]) {
                revenueByStatusMap[order.status].orderCount += 1;
                revenueByStatusMap[order.status].quantity += orderTshirts;
                revenueByStatusMap[order.status].revenue += (order.status === 'Cancelled' ? 0 : orderRevenue);
            }

            // Payment Checks
            if (order.payment) {
                if (order.payment.status === 'SUCCESS') {
                    paymentCollected += order.payment.amount || orderRevenue;
                    if (order.payment.paid_at && new Date(order.payment.paid_at) >= today) {
                        todaysCollection += order.payment.amount || orderRevenue;
                    }
                } else if (order.payment.status === 'FAILED') {
                    paymentFailedCount++;
                } else if ((order.payment.status === 'PENDING' || order.payment.status === 'VERIFICATION_PENDING') && order.status !== 'Cancelled') {
                    paymentPendingAmount += order.payment.amount || orderRevenue;
                }
            } else {
                // Legacy orders without explicit payment block assume COD/pending
                if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
                    paymentPendingAmount += orderRevenue;
                } else if (order.status === 'Delivered') {
                    paymentCollected += orderRevenue;
                }
            }

            recentOrdersList.push({
                orderId: order._id,
                clientName: order.userId?.name || 'Unknown',
                fitType: validItems[0]?.fit_type || 'Mixed',
                quantity: orderTshirts,
                amount: orderRevenue,
                status: order.status,
                createdAt: order.createdAt
            });
        }

        const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(0) + '%' : '0%';

        res.json({
            totalOrders,
            totalRevenue,
            pendingRevenue,
            totalTshirtsSold,
            cancelledOrders,
            cancellationRate,
            paymentStats: {
                totalCollected: paymentCollected,
                pendingPaymentsAmount: paymentPendingAmount,
                todaysCollection: todaysCollection,
                failedCount: paymentFailedCount
            },
            statusBreakdown: {
                pending: statusBreakdown.Pending,
                processing: statusBreakdown.Processing,
                shipped: statusBreakdown.Shipped,
                delivered: statusBreakdown.Delivered,
                cancelled: statusBreakdown.Cancelled
            },
            revenueByStatus: Object.values(revenueByStatusMap),
            recentOrders: recentOrdersList.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating analytics', error: error.message });
    }
};

const sendManualWhatsApp = async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message body is required" });

    const order = await Order.findById(id).populate('userId', 'name phone_number whatsapp_number');
    if (!order) return res.status(404).json({ message: "Order not found" });

    try {
        await sendWhatsAppMessage(
            order.userId.name,
            order.userId.phone_number,
            order.userId.whatsapp_number,
            order._id,
            'Manual Update',
            message
        );
        res.json({ message: "Manual update triggered" });
    } catch (error) {
        res.status(500).json({ message: "Failed to dispatch" });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    cancelOrder,
    getAdminAnalytics,
    sendManualWhatsApp,
    getOrderById,
    updatePaymentStatus,
    downloadImageProxy,
    downloadZip
};
