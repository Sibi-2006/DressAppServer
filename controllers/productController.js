const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { fit_type } = req.query;
        const filter = fit_type ? { fit_type } : {};
        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public (should be Admin, but for simplicity we keep it open for now)
const createProduct = async (req, res) => {
    try {
        const { color, hex, price, fit_type } = req.body;
        const product = new Product({ color, hex, price, fit_type });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
    try {
        const { color, hex, price, fit_type } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            product.color = color || product.color;
            product.hex = hex || product.hex;
            product.price = price !== undefined ? price : product.price;
            product.fit_type = fit_type || product.fit_type;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getProducts, createProduct, updateProduct };
