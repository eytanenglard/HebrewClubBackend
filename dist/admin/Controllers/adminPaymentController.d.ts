import { Request, Response } from 'express';
export declare const getPaymentManagementData: (req: Request, res: Response) => Promise<void>;
export declare const processPayment: (req: Request, res: Response) => Promise<void>;
export declare const refundPayment: (req: Request, res: Response) => Promise<void>;
