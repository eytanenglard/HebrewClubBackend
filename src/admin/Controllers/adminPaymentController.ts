import { Request, Response } from 'express';
import Payment from '../../models/Payment';
import { Payment as PaymentType, ApiResponse } from '../../types/models';

export const getPaymentManagementData = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title');
    res.json({ success: true, data: payments } as ApiResponse<PaymentType[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching payment data' } as ApiResponse<null>);
  }
};

export const processPayment = async (req: Request, res: Response): Promise<void> => {
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
    res.status(201).json({ success: true, data: newPayment } as ApiResponse<PaymentType>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error processing payment' } as ApiResponse<null>);
  }
};

export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found' } as ApiResponse<null>);
      return;
    }
    payment.status = 'refunded';
    await payment.save();
    res.json({ success: true, data: payment } as ApiResponse<PaymentType>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error refunding payment' } as ApiResponse<null>);
  }
};