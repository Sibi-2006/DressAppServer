const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

// Import Product model
const Product = require('./models/productModel')

const products = [

    // ── NORMAL FIT ──────────────────────────

    {
        name: 'Classic T-Shirt',
        fit_type: 'NORMAL_FIT',
        price: 499,
        colors: ['Black', 'White', 'Skyblue', 'Purple'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        description:
            'Premium quality normal fit t-shirt. ' +
            'Customize with your own design.',
        images: {
            Black: {
                front: '/assets/NORMAL_FIT/Normal_fit_Black_frontside.png',
                back: '/assets/NORMAL_FIT/Normal_fit_Black_backside.png'
            },
            White: {
                front: '/assets/NORMAL_FIT/Normal_fit_White_frontside.png',
                back: '/assets/NORMAL_FIT/Normal_fit_White_backside.png'
            },
            Skyblue: {
                front: '/assets/NORMAL_FIT/Normal_fit_Skyblue_frontside.png',
                back: '/assets/NORMAL_FIT/Normal_fit_Skyblue_backside.png'
            },
            Purple: {
                front: '/assets/NORMAL_FIT/Normal_fit_Purple_frontside.png',
                back: '/assets/NORMAL_FIT/Normal_fit_Purple_backside.png'
            }
        },
        in_stock: true,
        is_active: true
    },

    // ── OVERSIZED FIT ────────────────────────

    {
        name: 'Oversized Street Tee',
        fit_type: 'OVERSIZED_FIT',
        price: 699,
        colors: ['Black', 'White', 'Skyblue', 'Purple'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        description:
            'Premium quality oversized fit t-shirt. ' +
            'Customize with your own design.',
        images: {
            Black: {
                front:
                    '/assets/OVERSIZED_FIT/Oversized_fit_Black_frontside.png',
                back:
                    '/assets/OVERSIZED_FIT/Oversized_fit_Black_backside.png'
            },
            White: {
                front:
                    '/assets/OVERSIZED_FIT/Oversized_fit_White_frontside.png',
                back:
                    '/assets/OVERSIZED_FIT/Oversized_fit_White_backside.png'
            },
            Skyblue: {
                front:
                    '/assets/OVERSIZED_FIT/Oversized_fit_Skyblue_frontside.png',
                back:
                    '/assets/OVERSIZED_FIT/Oversized_fit_Skyblue_backside.png'
            },
            Purple: {
                front:
                    '/assets/OVERSIZED_FIT/Oversized_fit_Purple_frontside.png',
                back:
                    '/assets/OVERSIZED_FIT/Oversized_fit_Purple_backside.png'
            }
        },
        in_stock: true,
        is_active: true
    }
]

const seedDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI
        if (!MONGO_URI) {
            throw new Error('No MONGO_URI (or MONGODB_URI) in .env file')
        }
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB connected')

        // Clear existing products
        await Product.deleteMany({})
        console.log('Existing products cleared')

        // Insert new products
        await Product.insertMany(products)
        console.log('Products added successfully!')

        // Show what was added
        const count = await Product.countDocuments()
        console.log(`Total products in DB: ${count}`)

        mongoose.disconnect()
        console.log('Done!')
        process.exit(0)

    } catch (error) {
        console.error('Seeder error:', error)
        process.exit(1)
    }
}

seedDB()
