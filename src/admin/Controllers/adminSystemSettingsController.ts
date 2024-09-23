import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings';


export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const { settingKey, settingValue } = req.body;
    const updatedSetting = await SystemSettings.findOneAndUpdate(
      { key: settingKey },
      { value: settingValue },
      { new: true, upsert: true }
    );
    res.json(updatedSetting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating system settings', error });
  }
};

export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SystemSettings.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system settings', error });
  }
};