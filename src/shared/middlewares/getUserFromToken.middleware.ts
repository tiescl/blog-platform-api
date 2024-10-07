import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthenticationError } from "shared/errors";

export function getUserFromToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.headers.authorization?.split(" ")[1];
    const key = process.env.SECRET_JWT_KEY;

    if (!token || !key) {
        throw new AuthenticationError("Failed to identify user");
    }

    jwt.verify(token, key, async (err, decodedToken) => {
        try {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    throw new AuthenticationError(
                        `Token expired. Date: ${err.expiredAt.toISOString()}`
                    );
                } else {
                    throw new AuthenticationError(
                        "Failed to identify user"
                    );
                }
            } else {
                if (typeof decodedToken == "object") {
                    res.locals.userId = decodedToken.id;
                } else {
                    res.locals.userId = decodedToken;
                }

                next();
            }
        } catch (err) {
            next(err);
        }
    });
}
