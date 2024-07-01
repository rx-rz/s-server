import { sign, verify } from "jsonwebtoken";
import { ENV_VARS } from "../../env";
import { NextFunction, Request, Response } from "express";
import { httpstatus } from "../ctx";
import { routesThatDontRequireAuthentication } from "../routes";

export type User = {
  id: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
  isVerified: boolean | null;
  firstName: string | null;
  lastName: string | null;
};
function decodeUserToken(token: string) {
  const userToken = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  return userToken as User;
}

export function generateAccessToken(user: User) {
  const token = sign({ user }, ENV_VARS.JWT_SECRET!, { expiresIn: "15m" });
  return token;
}

export function generateRefreshToken(email: string) {
  if (!ENV_VARS.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  const token = sign({ email }, ENV_VARS.JWT_REFRESH_SECRET!, {
    expiresIn: "10d",
  });
  return token;
}
 
export function verifyRequest(req: Request, res: Response, next: NextFunction) {
  if (routesThatDontRequireAuthentication.includes(req.path)) next();
  else {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(httpstatus.UNAUTHORIZED).json({
        error_type: "JWT Error",
        error: "Unauthorized request. No token provided.",
        isSuccess: false,
      });
    }
    const user = decodeUserToken(token);
    const refreshToken = req.cookies?.refreshToken || "";
    verify(token, ENV_VARS.JWT_SECRET!, async (err) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          const { isExpired } = checkIfRefreshTokenHasExpired(refreshToken);
          if (isExpired === false) {
            const newAccessToken = generateAccessToken(user);
            res.setHeader("Authorization", `Bearer ${newAccessToken}`);
            return next();
          }else{
            return res.status(403).json({message: "Refresh token has expired."})
          }
        }
        return res
          .status(403)
          .json({ message: "Failed to authenticate token" });
      }
      next();
    });
  }
}

function checkIfRefreshTokenHasExpired(refreshToken: string) {
  let isExpired = false;
  verify(refreshToken, ENV_VARS.JWT_REFRESH_SECRET, async (err) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        isExpired = true;
      }
    }
  });
  return { isExpired };
}
