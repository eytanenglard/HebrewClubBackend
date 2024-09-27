import Payment from '../../models/Payment.js';
export const getPaymentManagementData = async (res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('courseId', 'title');
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error fetching payment data' });
    }
};
export const processPayment = async (req, res) => {
    try {
        const { userId, courseId, amount, currency, paymentMethod } = req.body;
        const newPayment = new Payment({
            userId,
            courseId,
            amount,
            currency,
            status: 'completed',
            paymentMethod,
            transactionId: 'TRANS_' + Date.now() // In a real scenario, this would come from a payment gateway
        });
        await newPayment.save();
        res.status(201).json({ success: true, data: newPayment });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error processing payment' });
    }
};
export const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        if (!payment) {
            res.status(404).json({ success: false, error: 'Payment not found' });
            return;
        }
        payment.status = 'refunded';
        await payment.save();
        res.json({ success: true, data: payment });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error refunding payment' });
    }
};
