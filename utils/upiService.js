const generateOrderId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `NT-${year}-${randomNum}`;
};

const generateUPILink = (orderId, amount) => {
    const upiId = process.env.UPI_ID || '7598382584@ptaxis';
    const businessName = process.env.BUSINESS_NAME || 'NEONTHREADS';
    // Ensure amount is fixed to 2 decimal places
    const formattedAmount = Number(amount).toFixed(2);

    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent('NEONTHREADS Order ' + orderId)}`;
};

module.exports = { generateOrderId, generateUPILink };
