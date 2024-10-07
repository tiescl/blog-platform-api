import { Logger } from "shared/libs";
import { NextFunction, Request, Response } from "express";

export function loggerMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    Logger.info(`[${new Date().toISOString()}] ${req.method}: ${req.url}`);

    next();
}
