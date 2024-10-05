import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// eslint-disable-next-line
export function validateRequestBody(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map(
                    (error) => error.message
                );

                res.status(400).json({
                    message: "Bad Request",
                    errors: errorMessages
                });
            } else {
                res.status(400).json({
                    message: "Bad Request",
                    errors: ["Invalid Request Body"]
                });
            }
        }
    };
}
