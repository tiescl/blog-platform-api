import { Router } from "express";
import { AuthService } from "./auth.service";
import { validateRequestBody } from "shared/validators";
import { loginDtoSchema, signupDtoSchema } from "./dto";
import { StatusCode } from "shared/constants";

export const AuthController = Router();

AuthController.post(
    "/login",
    validateRequestBody(loginDtoSchema),
    async function (req, res) {
        const token = await AuthService.login(req.body);

        res.status(StatusCode.Ok).json({ token });
    }
);

AuthController.post(
    "/signup",
    validateRequestBody(signupDtoSchema),
    async function (req, res) {
        const { user, token } = await AuthService.signup(req.body);

        res.status(StatusCode.Created).json({
            user,
            token
        });
    }
);
