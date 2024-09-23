import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  res.on('finish', () => {
    const statusCode = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - Status: ${statusCode}`);
  });

  next();
};

export default logger;