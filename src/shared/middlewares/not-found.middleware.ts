import { Logger } from "shared/libs";
import { Request, Response } from "express";

export function notFoundMiddleware(req: Request, res: Response) {
    Logger.warn(`[${new Date().toISOString()}] 404: ${req.url}`);

    res.status(404).json({
        message: "Not Found"
    });
}
