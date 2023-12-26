const fetch = require('node-fetch');

const generateUniqueOrderId = () => {
    const prefix = "order";
    const timestamp = Date.now();
    return `${prefix}-${timestamp}`;
};

const juspaySessionApi = async (data) => {
    console.log("In the session api");
    console.log(data);
    const apiKey = process.env.JUSPAY_API_KEY;
    const merchantId = process.env.JUSPAY_MERCHENT_ID;
    const clientId = process.env.JUSPAY_CLIENT_ID;
    const authorization = "Basic " + Buffer.from(apiKey + ":").toString("base64");

    const orderId = generateUniqueOrderId();

    const requestPayload = JSON.stringify({
        "order_id": orderId,
        "amount": data.amount,
        "customer_id": data.phoneNumber,
        "customer_email": data.email,
        "customer_phone": data.phoneNumber,
        "payment_page_client_id": clientId,
        "action": "paymentPage",
        "return_url": "http://localhost:3000/",
        "description": "Complete your payment",
        "theme": "dark",
        "first_name": data.firstName,
        "last_name": data.lastName
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': authorization,
            'x-merchantid': merchantId,
            'Content-Type': 'application/json'
        },
        body: requestPayload
    };

    try {
        const response = await fetch("https://api.juspay.in/session", requestOptions);
        console.log(response);

        if (response.status === 200) {
            const result = await response.json();
            console.log(result);
            const paymentLink = result.payment_links.web;
            console.log(result.order_id);

            // Send payment link to the frontend
            return { success: true, paymentLink, result };
        } else {
            // Handle non-200 status codes
            const errorDetails = await response.json();
            return { success: false, error: `HTTP error: ${response.status}`, errorDetails };
        }
    } catch (error) {
        console.error('Error calling Juspay session API:', error);
        return { success: false, error: 'Error calling Juspay session API', errorDetails: error.message };
    }
};

module.exports = {
    juspaySessionApi
};