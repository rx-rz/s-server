import { sign, verify } from "jsonwebtoken";
import { ENV_VARS } from "../../env";
import { NextFunction, Request, Response } from "express";
import { httpstatus } from "../ctx";
import { routesThatDontRequireAuthentication } from "../routes";
import { compare } from "bcryptjs";
import { adminRepository } from "../admin";

export type User = {
  id: string;
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

async function verifyRefreshToken(providedToken: string, email: string) {
  const refreshTokenInDB = await adminRepository.getRefreshToken(email);
  const isValid = await compare(providedToken, refreshTokenInDB);
  return isValid;
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

export function verifyRequest(req: Request, res: Response, next: NextFunction) {
  if (routesThatDontRequireAuthentication.includes(req.path)) next();
  else {
    const [token, refreshToken] = [
      req.cookies?.token,
      req.cookies?.refreshToken,
    ];
    if (!token) {
      return res.status(httpstatus.UNAUTHORIZED).json({
        error_type: "JWT Error",
        error: "Unauthorized request. No token provided.",
        isSuccess: false,
      });
    }
    const user = decodeUserToken(token);
    if (!user) {
      return res.status(httpstatus.UNPROCESSABLE_ENTITY).json({
        error_type: "JWT Error",
        error: "Invalid token",
        isSuccess: false,
      });
    }
    verify(token, ENV_VARS.JWT_SECRET!, async (err: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          const { isExpired } = checkIfRefreshTokenHasExpired(refreshToken);
          if (isExpired) {
            return res.status(httpstatus.MOVED_TEMPORARILY).json({
              isSuccess: false,
              error_type: "JWT Error",
              error: "Refresh token has expired, Please go to the login page",
            });
          }
          const isValid = await verifyRefreshToken(refreshToken, user.email);
          if (isValid) {
            const newAccessToken = generateAccessToken(user);
            res.cookie("token", newAccessToken, {
              httpOnly: true,
              secure: ENV_VARS.NODE_ENV === "production" ? true : false,
              path: "/",
              maxAge: 10 * 60 * 1000,
            });
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
