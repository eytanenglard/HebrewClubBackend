import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LOG_PREFIX = '[emailService.ts]';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
console.log(`${LOG_PREFIX} API_BASE_URL:`, API_BASE_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


export const sendWelcomeEmail = async (to: string, name: string, temporaryPassword: string): Promise<boolean> => {
  try {
    const response = await api.post('/email/welcome', { to, name, temporaryPassword });
    return response.data.success;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendCourseWelcomeEmail = async (to: string, userName: string, courseName: string): Promise<boolean> => {
  try {
    const response = await api.post('/email/course-welcome', { to, userName, courseName });
    return response.data.success;
  } catch (error) {
    console.error('Error sending course welcome email:', error);
    throw error;
  }
};