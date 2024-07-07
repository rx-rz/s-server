import { Handler } from "express";
import { User } from "./jwt-token";
import { httpstatus } from "../ctx";
import { adminOnlyRoutes, customerOnlyRoutes } from "../routes";

type UserToken = {
  user: User;
  iat: number;
  exp: number;
};
export function decodeUserToken(token: string) {
  const userToken = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  return userToken;
}

export const adminAccessOnly: Handler = (req, res, next) => {
  if (adminOnlyRoutes.includes(req.path)) {
    const userToken =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!userToken) {
      return res.status(httpstatus.UNAUTHORIZED).json({
        error_type: "JWT Error",
        error: "Unauthorized request. No token provided.",
        isSuccess: false,
      });
    }
    const token: UserToken = decodeUserToken(userToken);
    if (!token) {
      return res.status(httpstatus.FORBIDDEN).json({
        error_type: "JWT Error",
        error: "Unauthorized request. No token provided",
        isSuccess: false,
      });
    }
    if (token.user.role !== "ADMIN") {
      return res.status(httpstatus.FORBIDDEN).json({
        error_type: "User Role Error",
        error: "Unauthorized request. Only admins can access this route.",
        isSuccess: false,
      });
    }
  }
  next();
};

export const customerAccessOnly: Handler = (req, res, next) => {
  if (customerOnlyRoutes.includes(req.path)) {
    const userToken = req.headers.authorization?.split(" ")[1];
    if (!userToken) {
      return res.status(httpstatus.UNAUTHORIZED).json({
        error_type: "JWT Error",
        error: "Unauthorized request. No token provided.",
        isSuccess: false,
      });
    }
    const token: UserToken = decodeUserToken(userToken);
    if (token.user.role !== "CUSTOMER") {
      return res.status(httpstatus.FORBIDDEN).json({
        error_type: "User Role Error",
        error: "Unauthorized request. Only customers can access this route.",
        isSuccess: false,
      });
    }
  }
  next();
};
