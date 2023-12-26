const fetch = require('node-fetch');

const getOrderStatus = async (orderId) => {
    console.log("In the order status api");
    const apiKey = process.env.JUSPAY_API_KEY;
    const merchantId = process.env.JUSPAY_MERCHENT_ID;
    const version = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const authorization = "Basic " + Buffer.from(apiKey + ":").toString("base64");

    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': authorization,
            'x-merchantid': merchantId,
            'version': version,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    try {
        const response = await fetch(`https://api.juspay.in/orders/${orderId}`, requestOptions);
        if (response.ok) {
            const result = await response.json();
            return { success: true, result };
        } else {
            const errorDetails = await response.json();
            return { success: false, error: `HTTP error: ${response.status}`, errorDetails };
        }
    } catch (error) {
        console.error('Error calling Juspay order status API:', error);
        return { success: false, error: 'Error calling Juspay order status API', errorDetails: error.message };
    }
};

module.exports = {
    getOrderStatus,
};