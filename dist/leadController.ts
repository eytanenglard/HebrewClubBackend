import { Request, Response } from 'express';
import Lead from '../models/Lead.js';
import { Lead as LeadType, ApiResponse } from '../types/models.js';

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, courseInterest } = req.body;
    const newLead = new Lead({ name, email, phone, courseInterest });
    await newLead.save();
    res.status(201).json({ 
      success: true, 
      message: 'Lead created successfully', 
      data: newLead 
    } as ApiResponse<LeadType>);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Error creating lead' 
    } as ApiResponse<null>);
  }
};

export const getLeads = async (res: Response) => {
  try {
    const leads = await Lead.find();
    res.json({ success: true, data: leads } as ApiResponse<LeadType[]>);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, error: 'Server error' } as ApiResponse<null>);
  }
};

export default {
  createLead,
};