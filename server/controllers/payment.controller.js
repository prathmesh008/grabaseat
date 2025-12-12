const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
// Note: User must set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
console.log("Razorpay Config Check -> KeyID:", process.env.RAZORPAY_KEY_ID ? "Exists" : "Missing");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "YOUR_TEST_KEY_ID",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_TEST_KEY_SECRET"
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID || "YOUR_TEST_KEY_ID"
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Unable to create order", error });
    }
};

exports.verifyPaymentSignature = (orderId, paymentId, signature) => {
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_TEST_KEY_SECRET")
        .update(orderId + "|" + paymentId)
        .digest("hex");

    return generated_signature === signature;
};
