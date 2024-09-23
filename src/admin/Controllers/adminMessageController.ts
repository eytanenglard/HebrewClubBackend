import { Request, Response } from 'express';
import Message from '../../models/Message';
import { Message as MessageType, ApiResponse } from '../../types/models';

export const getMessageManagementData = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
    res.json({ success: true, data: messages } as ApiResponse<MessageType[]>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching message data' } as ApiResponse<null>);
  }
};

export const sendAdminMessage = async (req: Request, res: Response) => {
  try {
    const { recipientId, subject, content } = req.body;
    const newMessage = new Message({
      sender: req.user!._id, // Assuming the admin's user ID is available in req.user
      recipient: recipientId,
      subject,
      content,
      isRead: false
    });
    await newMessage.save();
    res.status(201).json({ success: true, data: newMessage } as ApiResponse<MessageType>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error sending admin message' } as ApiResponse<null>);
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(id);
    if (!deletedMessage) {
      return res.status(404).json({ success: false, error: 'Message not found' } as ApiResponse<null>);
    }
    res.json({ success: true, message: 'Message deleted successfully' } as ApiResponse<null>);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error deleting message' } as ApiResponse<null>);
  }
};