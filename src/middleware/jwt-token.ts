import { sign, verify } from "jsonwebtoken";
import { ENV_VARS } from "../../env";
import { NextFunction, Request, Response } from "express";
import { httpstatus } from "../ctx";
type User = {
  id: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
};

interface AuthenticatedRequest extends Request {
  user_info?: string;
}
export function generateAccessToken(user: User) {
  const token = sign(user, ENV_VARS.JWT_SECRET!);
  return token;
}

export function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(httpstatus.FORBIDDEN).json({
      error_type: "JWT Error",
      error: "Unauthorized request. No token provided.",
      isSuccess: false,
    });
  }
  verify(token, ENV_VARS.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }

    req.user_info = JSON.stringify(decoded);
    next();
  });
}
