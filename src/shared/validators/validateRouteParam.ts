import { NextFunction, Request, Response } from "express";
import { StatusCode } from "shared/constants";
import { z, ZodError } from "zod";

export function validateRouteParameter(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map(
                    (error) => error.message
                );

                res.status(StatusCode.BadRequest).json({
                    message: "Bad Request",
                    errors: errorMessages
                });
            } else {
                res.status(StatusCode.BadRequest).json({
                    message: "Bad Request",
                    errors: ["Invalid Param"]
                });
            }
        }
    };
}
