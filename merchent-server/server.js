require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const { storeData, getData } = require("./controller/firebaseFunctions");
const { juspaySessionApi } = require("./controller/session-api");
const { getOrderStatus } = require('./controller/order-status');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Example route to store data
app.post("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../merchent-client/build", "index.html"));
});

app.post("/payment-status", async (req, res) => {
  const paymentStatus = 'success'; // or 'failure'
  const orderId = 'your_order_id';

  // Send the data as JSON
  res.json({ paymentStatus, orderId });
});


app.post("/payment", async (req, res) => {
    const { collectionName, data } = req.body;

    try {
        // Step 1: Handle payment
        const paymentResult = await juspaySessionApi(data);
        console.log(paymentResult);

        // Check the payment result and proceed accordingly
        if (paymentResult.success) {
            // Step 2: Store registration details
            const phoneNumber = data.phoneNumber;
            console.log(data, typeof data.amount);
            

            // Step 3: Call handlePaymentCompletion to get order details
            const orderStatusResult = await getOrderStatus(paymentResult.result.order_id);
            console.log('Order Details: ', orderStatusResult);

            // Check the order status result and send response to frontend
            if (orderStatusResult.success && orderStatusResult.result.status === 'NEW') {
                // Payment and order are both successful
                const documentId = await storeData(collectionName, phoneNumber, {data, orderId: orderStatusResult.result.order_id});
                return res.status(200).json({
                    success: true,
                    paymentLink: paymentResult.paymentLink,
                    orderDetails: orderStatusResult.result,
                });
            } else {
                // Handle other order statuses if needed
                return res.status(400).json({
                    success: false,
                    error: `Order status is not successful: ${orderStatusResult.result.status}`,
                });
            }
        } else {
            // Payment failed
            return res.status(400).json({
                success: false,
                error: "Payment failed",
                paymentError: paymentResult.error,
            });
        }
    } catch (error) {
        console.error('Error handling registration:', error);
        return res.status(500).json({ success: false, error: 'Error in registration process', detailedError: error.message });
    }
});


app.post("/getUserDetails/", async (req, res) => {
  try {
    const userData = await getData("registrations");
    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.error("Error fetching user details: ", error);
    res
      .status(500)
      .json({ success: false, error: "Error fetching user details" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../merchent-client/build")));

// All other routes will be handled by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../merchent-client/build", "index.html"));
});

app.listen(port, (err) => {
  if (err) {
    console.log("Error in starting server at port number", port, err);
    return;
  }
  console.log(`Server is running at http://localhost:${port}`);
});
