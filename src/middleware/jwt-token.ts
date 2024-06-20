import { sign, verify } from "jsonwebtoken";
import { ENV_VARS } from "../../env";
import { NextFunction, Request, Response } from "express";
import { httpstatus } from "../ctx";
import { routesThatDontRequireAuthentication } from "../routes";

export type User = {
  id: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
  is_verified: boolean | null;
  hasCreatedPasswordForAccount: boolean | null;
  firstName: string | null;
  lastName: string | null;
};

export function generateAccessToken(user: User) {
  const token = sign(user, ENV_VARS.JWT_SECRET!, { expiresIn: "15m" });
  return token;
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (routesThatDontRequireAuthentication.includes(req.path)) next();
  else {
    if (!token) {
      return res.status(httpstatus.FORBIDDEN).json({
        error_type: "JWT Error",
        error: "Unauthorized request. No token provided.",
        isSuccess: false,
      });
    }
    verify(token, ENV_VARS.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Failed to authenticate token" });
      }
      next();
    });
  }
}
