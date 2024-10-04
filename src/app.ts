import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import {
    notFoundMiddleware,
    errorMiddleware,
    loggerMiddleware
} from "./shared/middlewares";

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

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        message: new Date().toISOString()
    });
});

// ==== Routes ==== //
app.use(notFoundMiddleware);
app.use(errorMiddleware);
