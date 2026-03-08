# NEONTHREADS — Server API 🖥️⚡

> The backend REST API for NEONTHREADS custom T-shirt platform. Built with Node.js + Express + MongoDB Atlas. Handles authentication, orders, payments, image uploads, and WhatsApp notifications.

🌐 **Live API:** [https://dressappserver.onrender.com](https://dressappserver.onrender.com)  
📡 **Health Check:** [https://dressappserver.onrender.com/api/health](https://dressappserver.onrender.com/api/health)

---

## 🚀 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| POST | `/api/auth/register` | Register new client |
| POST | `/api/auth/login` | Client login |
| POST | `/api/auth/logout` | Client logout |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |

### 🛍️ Products
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/admin/products` | Add new product |
| PATCH | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |

### 🛒 Cart
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart/add` | Add item to cart |
| PATCH | `/api/cart/update` | Update item quantity |
| DELETE | `/api/cart/remove/:id` | Remove cart item |
| DELETE | `/api/cart/clear` | Clear entire cart |

### 📦 Orders
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| POST | `/api/orders/create` | Create new order |
| GET | `/api/orders` | Get user orders |
| GET | `/api/orders/:id` | Get single order |
| PATCH | `/api/orders/:id/cancel` | Cancel order |
| PATCH | `/api/admin/orders/:id/status` | Update order status |

### 💳 Payments
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| PATCH | `/api/orders/:id/payment` | Submit UTR number |
| GET | `/api/admin/analytics` | Get payment analytics |

### 🖼️ Image Upload
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| POST | `/api/upload` | Upload design image |
| GET | `/api/admin/download-image` | Download single image |
| GET | `/api/admin/download-zip/:id` | Download all as ZIP |

### 📊 Admin
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| GET | `/api/admin/orders` | Get all orders |
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET | `/api/admin/toast-message` | Get toast settings |
| PATCH | `/api/admin/toast-message` | Update toast message |

### ❤️ Health
| Method | Endpoint | Description |
|:--- |:--- |:--- |
| GET | `/api/health` | Server health check |

---

## 🗄️ Database Collections

| Collection | Purpose |
|:--- |:--- |
| **users** | Client accounts |
| **admins** | Admin accounts |
| **admin_sessions** | Admin login sessions |
| **products** | T-shirt products |
| **orders** | All orders with designs |
| **carts** | Per-user cart data |
| **payments** | Payment records with UTR |
| **notifications** | WhatsApp message logs |
| **app_settings** | Admin configurable settings |

---

## ✨ Features

### 🔐 Security
- **JWT Authentication**: Secured via `httpOnly` cookies.
- **Session Management**: Admin sessions (24hrs) and Client sessions (7 days).
- **Protection**: Rate limiting on login, input sanitization, Helmet headers, and CORS protection.

### 🖼️ Image Management
- **Cloud Storage**: Cloudinary integration for robust asset handling.
- **Multi-Format**: Supports JPG, PNG, WEBP, SVG, GIF, BMP, TIFF.
- **Organization**: Images handled by side (front/back).
- **Bulk Export**: Backend ZIP generation for admin fulfillment.

### 📱 WhatsApp Notifications
- **Status Sync**: Automatic messages on every order status change.
- **Templates**: Dynamic, admin-editable templates.
- **Tracking**: Comprehensive log for delivery success tracking.

### 💳 UPI Payment
- **Deep Linking**: Fixed-amount UPI link generation.
- **Validation**: UTR number verification system.
- **Experience**: QR code support for seamless desktop-to-mobile payments.

---

## 📦 Tech Stack

| Category | Technology |
|:--- |:--- |
| **Runtime** | Node.js v22 |
| **Framework** | Express.js 5 |
| **Database** | MongoDB Atlas + Mongoose |
| **Authentication** | JWT + httpOnly Cookies |
| **Image Storage** | Cloudinary |
| **File Upload** | Multer |
| **WhatsApp** | Twilio WhatsApp API |
| **Security** | Helmet + express-rate-limit |
| **ZIP Export** | JSZip |

---

## 🖥️ Local Development

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account
- Cloudinary account

### Setup

```bash
# Clone the repository
git clone https://github.com/Sibi-2006/DressAppServer.git

# Go to server folder
cd DressAppServer

# Install dependencies
npm install

# Create .env file
# Fill in your own credentials using .env.example as a template
```

### Start Server

```bash
# Standard start
node server.js

# Development (auto-restart)
npx nodemon server.js
```

---

## 🌍 Environment Variables

Create a `.env` file in the root. **Never commit this file.**

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=production
UPI_ID=your_upi_id
BUSINESS_NAME=NEONTHREADS
WHATSAPP_SENDER=your_whatsapp_number
```

---

## 📁 Project Structure

```text
server/
├── config/             ← DB and Cloudinary configuration
├── controllers/        ← Request handlers (Auth, Order, Cart, etc.)
├── middleware/         ← JWT and Admin authorization
├── models/             ← Mongoose schemas (User, Order, Product, etc.)
├── routes/             ← API route definitions
├── utils/              ← UPI and WhatsApp utility functions
├── seeder.js           ← Database initialization script
├── server.js           ← Application entry point
└── package.json
```

---

## 🔒 Security Notes
- All sensitive tokens use `httpOnly` cookies to prevent XSS.
- Admin sessions are server-tracked for maximum security.
- Comprehensive rate limiting and sanitization protocols in place.

---

## 👤 Author

Built with 💙 by **Sibi**  
GitHub: [https://github.com/Sibi-2006](https://github.com/Sibi-2006)

---

## 📄 License

This project is for personal and educational use only.
