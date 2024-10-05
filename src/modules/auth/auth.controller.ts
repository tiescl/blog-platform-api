import { Router } from "express";
import { AuthService } from "./auth.service";
import { validateRequestBody } from "shared/validators";
import { loginDtoSchema, signupDtoSchema } from "./dto";

export const AuthController = Router();

AuthController.post(
    "/login",
    validateRequestBody(loginDtoSchema),
    async function (req, res) {
        const token = await AuthService.login(req.body);

        res.status(200).json({ token });
    }
);

AuthController.post(
    "/signup",
    validateRequestBody(signupDtoSchema),
    async function (req, res) {
        const { user, token } = await AuthService.signup(req.body);

        res.status(201).json({
            user,
            token
        });
    }
);
