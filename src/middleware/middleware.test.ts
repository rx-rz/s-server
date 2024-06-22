import { NextFunction, Request, Response } from "express"
import { beforeEach } from "node:test"
import { Mock, describe, expect, it, vi } from "vitest"
import { verifyRequest } from "./jwt-token"
import { httpstatus } from "../ctx"

process.env.JWT_SECRET = "secret-key"

vi.mock("jsonwebtoken", () => ({
  verify: vi.fn()
}))

describe("verify token middleware", () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    }
    next = vi.fn().mockReturnThis()
  })

  it("should return 403 if no token is provided", () => {
    req.headers = {
      'content-type': 'application/json'
    }
    verifyRequest(req as Request, res as Response, next)
    expect(res.status).toHaveBeenCalledWith(httpstatus.FORBIDDEN)
    expect(res.json).toHaveBeenCalledWith({
      error_type: "JWT Error",
      error: "Unauthorized request. No token provided.",
      isSuccess: false,
    })
    expect(next).toBeCalledTimes(0)
  })

  it("should return 403 if token verification fails", () => {
    req.headers = {
      authorization: `Bearer invalid-token`
    }
    // vi.mock()
  })
})