import { Request, Response } from 'express';
export declare const getLeads: (req: Request, res: Response) => Promise<void>;
export declare const createLead: (req: Request, res: Response) => Promise<void>;
export declare const updateLead: (req: Request, res: Response) => Promise<void>;
export declare const deleteLead: (req: Request, res: Response) => Promise<void>;
export declare const getLeadManagementData: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getLeads: (req: Request, res: Response) => Promise<void>;
    createLead: (req: Request, res: Response) => Promise<void>;
    updateLead: (req: Request, res: Response) => Promise<void>;
    deleteLead: (req: Request, res: Response) => Promise<void>;
    getLeadManagementData: (req: Request, res: Response) => Promise<void>;
};
export default _default;
