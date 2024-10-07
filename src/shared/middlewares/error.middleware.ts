import { Logger } from "shared/libs";
import { NextFunction, Request, Response } from "express";
import { StatusCode } from "shared/constants";

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    Logger.error(`[${new Date().toISOString()}] ${err}`);

    if (err.name == "AuthenticationError") {
        return res.status(StatusCode.Unauthenticated).json({
            message: err.message
        });
    }

    if (err.name == "NotFoundError") {
        return res.status(StatusCode.NotFound).json({
            message: err.message
        });
    }

    if (err.name == "BadRequestError") {
        return res.status(StatusCode.BadRequest).json({
            message: err.message
        });
    }

    if (err.name == "DatabaseError" || err.name == "ServerError") {
        return res.status(StatusCode.ServerError).json({
            message: err.message
        });
    }

    res.status(StatusCode.ServerError).json({
        message: "Internal Server Error"
    });

    next();
}
