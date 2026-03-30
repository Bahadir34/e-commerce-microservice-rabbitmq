import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { RouteParams } from "../types/index.ts";

const catchAsync = (fn: RouteParams): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(() => {
      next();
    });
  };
};

export default catchAsync;
