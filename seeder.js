const Product = require('./models/productModel');

const seedProducts = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                { color: 'Black', hex: '#000000', price: 29.99, fit_type: 'NORMAL_FIT' },
                { color: 'White', hex: '#ffffff', price: 29.99, fit_type: 'NORMAL_FIT' },
                { color: 'Blue', hex: '#00ddec', price: 29.99, fit_type: 'NORMAL_FIT' },
                { color: 'Purple', hex: '#ac00e6', price: 29.99, fit_type: 'NORMAL_FIT' },
                // Oversized Fits
                { color: 'Black', hex: '#000000', price: 34.99, fit_type: 'OVERSIZED_FIT' },
                { color: 'White', hex: '#ffffff', price: 34.99, fit_type: 'OVERSIZED_FIT' },
                { color: 'Blue', hex: '#00ddec', price: 34.99, fit_type: 'OVERSIZED_FIT' },
                { color: 'Purple', hex: '#ac00e6', price: 34.99, fit_type: 'OVERSIZED_FIT' },
            ];
            await Product.insertMany(initialProducts);
            console.log('Products Seeded!');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

module.exports = seedProducts;
