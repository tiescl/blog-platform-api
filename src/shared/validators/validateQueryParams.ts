import { NextFunction, Request, Response } from "express";
import { StatusCode } from "shared/constants";
import { z, ZodError } from "zod";
import { ParsedQs } from "qs";

// eslint-disable-next-line
export function validateQueryParams(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query);

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
                    errors: ["Invalid Query Params"]
                });
            }
        }
    };
}

export function getSearchParams<T>(query: ParsedQs): T {
    return query as T;
}
