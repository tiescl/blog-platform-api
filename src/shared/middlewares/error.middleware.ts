import { Logger } from "shared/libs";
import { Request, Response } from "express";
import {
    AuthenticationError,
    DatabaseError,
    NotFoundError
} from "shared/errors";

export function errorMiddleware(
    err: unknown,
    _req: Request,
    res: Response
) {
    Logger.error(`[${new Date().toISOString()}] ${err}`);

    if (err instanceof AuthenticationError) {
        return res.status(401).json({
            message: err.message
        });
    }

    if (err instanceof NotFoundError) {
        return res.status(404).json({
            message: err.message
        });
    }

    if (err instanceof DatabaseError) {
        return res.status(500).json({
            message: err.message
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });
}
