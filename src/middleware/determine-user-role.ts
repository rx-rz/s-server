import { Handler } from "express";
import { User } from "./jwt-token";
import { httpstatus } from "../ctx";

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

export const authorizedAccessOnly: Handler = (req, res, next) => {
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
  next();
};
