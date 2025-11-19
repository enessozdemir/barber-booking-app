import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface RequestWithUser extends Request {
  user?: any;
}

export function verifyToken(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
