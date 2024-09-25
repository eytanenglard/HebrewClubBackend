import { Request, Response } from 'express';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
    files?: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[];
}
export declare const getUsers: (req: Request, res: Response) => Promise<void>;
export declare const createUser: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: Request, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
export declare const setUserRole: (req: Request, res: Response) => Promise<void>;
export declare const toggleUserStatus: (req: Request, res: Response) => Promise<void>;
export declare const addUserToGroup: (req: Request, res: Response) => Promise<void>;
export declare const removeUserFromGroup: (req: Request, res: Response) => Promise<void>;
export declare const exportUsers: (req: Request, res: Response) => Promise<void>;
export declare const importUsers: (req: MulterRequest, res: Response) => Promise<void>;
export declare const resetUserPassword: (req: Request, res: Response) => Promise<void>;
export declare const getUserActivity: (req: Request, res: Response) => Promise<void>;
export declare const updateUserStatus: (req: Request, res: Response) => Promise<void>;
export declare const getUserStats: (req: Request, res: Response) => Promise<void>;
export declare const addCourseToUser: (req: Request, res: Response) => Promise<void>;
export declare const removeCourseFromUser: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
export declare const updateUserProfile: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getUsers: (req: Request, res: Response) => Promise<void>;
    createUser: (req: Request, res: Response) => Promise<void>;
    updateUser: (req: Request, res: Response) => Promise<void>;
    deleteUser: (req: Request, res: Response) => Promise<void>;
    setUserRole: (req: Request, res: Response) => Promise<void>;
    toggleUserStatus: (req: Request, res: Response) => Promise<void>;
    addUserToGroup: (req: Request, res: Response) => Promise<void>;
    removeUserFromGroup: (req: Request, res: Response) => Promise<void>;
    exportUsers: (req: Request, res: Response) => Promise<void>;
    importUsers: (req: MulterRequest, res: Response) => Promise<void>;
    resetUserPassword: (req: Request, res: Response) => Promise<void>;
    getUserActivity: (req: Request, res: Response) => Promise<void>;
    updateUserStatus: (req: Request, res: Response) => Promise<void>;
    getUserStats: (req: Request, res: Response) => Promise<void>;
    addCourseToUser: (req: Request, res: Response) => Promise<void>;
    removeCourseFromUser: (req: Request, res: Response) => Promise<void>;
    getAllUsers: (req: Request, res: Response) => Promise<void>;
    getUserById: (req: Request, res: Response) => Promise<void>;
    updateUserProfile: (req: Request, res: Response) => Promise<void>;
};
export default _default;
