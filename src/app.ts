import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

export const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
console.log(CLIENT_URL);

// ==== Middlewares ==== //
app.use(
    cors({
        origin: CLIENT_URL,
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: Date.now() });
});

// ==== Routes ==== //
