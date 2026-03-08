const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { fit_type, show_all } = req.query;
        let filter = {};

        if (show_all !== 'true') {
            filter.is_active = true;
        }

        if (fit_type) {
            filter.fit_type = fit_type;
        }

        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
    try {
        const { name, fit_type, price, colors, sizes, description, images, in_stock } = req.body;
        const product = new Product({
            name,
            fit_type,
            price,
            colors,
            sizes,
            description,
            images,
            in_stock
        });
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
        const { name, fit_type, price, colors, sizes, description, images, in_stock, is_active } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.fit_type = fit_type || product.fit_type;
            product.price = price !== undefined ? price : product.price;
            product.colors = colors || product.colors;
            product.sizes = sizes || product.sizes;
            product.description = description || product.description;
            product.images = images || product.images;
            product.in_stock = in_stock !== undefined ? in_stock : product.in_stock;
            product.is_active = is_active !== undefined ? is_active : product.is_active;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
