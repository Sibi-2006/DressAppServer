const Cart = require('../models/cartModel');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user_id: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
    const { name, fit_type, size, color, quantity, price, front_images, back_images, client_note } = req.body;

    try {
        let cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user_id: req.user._id, items: [] });
        }

        // Add item - for simplicity, just pushing. 
        // We could check if item with same fit/size/color exists to increment but often customized designs are unique
        cart.items.push({
            name,
            fit_type,
            size,
            color,
            quantity: Number(quantity),
            price: Number(price),
            front_images,
            back_images,
            client_note
        });

        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update item quantity
// @route   PATCH /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
    const { itemId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(itemId);
        if (item) {
            item.quantity = Number(quantity);
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
