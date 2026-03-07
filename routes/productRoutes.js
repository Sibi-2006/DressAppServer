const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct } = require('../controllers/productController');

// @desc    Fetch all products
// @route   GET /api/products
router.get('/', getProducts);

// @desc    Create a product
// @route   POST /api/products
router.post('/', createProduct);

// @desc    Update a product
// @route   PUT /api/products/:id
router.put('/:id', updateProduct);

module.exports = router;
