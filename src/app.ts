import express, { ErrorRequestHandler, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import "express-async-errors";
import {
    notFoundMiddleware,
    errorMiddleware,
    loggerMiddleware
} from "./shared/middlewares";
import { db } from "database/data-source";
import { AuthController } from "modules/auth/auth.controller";

export const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "*";

// ==== Middlewares ==== //
app.use(
    cors({
        origin: CLIENT_URL,
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.get("/", async (_req: Request, res: Response) => {
    const now = await db.manager.query("SELECT NOW()");

    res.status(200).json(now[0]);
});
app.use("/auth", AuthController);

// ==== Routes ==== //
app.use(notFoundMiddleware);
app.use(errorMiddleware as ErrorRequestHandler);
