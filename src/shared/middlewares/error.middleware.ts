import { Logger } from "shared/libs";
import { NextFunction, Request, Response } from "express";

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    Logger.error(`[${new Date().toISOString()}] ${err}`);

    if (err.name == "AuthenticationError") {
        return res.status(401).json({
            message: err.message
        });
    }

    if (err.name == "NotFoundError") {
        return res.status(404).json({
            message: err.message
        });
    }

    if (err.name == "DatabaseError" || err.name == "ServerError") {
        return res.status(500).json({
            message: err.message
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
}
