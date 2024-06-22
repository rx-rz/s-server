import { Handler } from "express";
import { User } from "./jwt-token";
import { httpstatus } from "../ctx";
import { adminOnlyRoutes, customerOnlyRoutes } from "../routes";

function decodeUserToken(token: string | undefined) {
  //the verify token middleware should already handle token edge cases
  //so there's no need for bells and whistles here.
  if (!token) throw new Error(`No token provided.`);
  const userToken = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  return userToken;
}

export const adminAccessOnly: Handler = (req, res, next) => {
  if (adminOnlyRoutes.includes(req.path)) {
    const userToken = req.headers.authorization?.split(" ")[1];
    const user: User = decodeUserToken(userToken);
    if (user.role !== "ADMIN") {
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
    const user: User = decodeUserToken(userToken);
    if (user.role !== "CUSTOMER") {
      return res.status(httpstatus.FORBIDDEN).json({
        error_type: "User Role Error",
        error: "Unauthorized request. Only customers can access this route.",
        isSuccess: false,
      });
    }
  }
  next();
};
