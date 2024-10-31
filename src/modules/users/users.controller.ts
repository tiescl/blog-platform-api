import { Router } from "express";
import { UsersService } from "./users.service";
import { authorizeAccess, getUserFromToken } from "shared/middlewares";
import {
    getRouteParams,
    validateRouteParameter,
    validateRequestBody
} from "shared/validators";
import { UsersIdDto, usersIdDtoSchema, usersRoleDtoSchema } from "./dto";
import { StatusCode } from "shared/constants";

export const UsersController = Router();

UsersController.get(
    "/profile",
    getUserFromToken,
    async function (_req, res) {
        const user = await UsersService.getUserById(res.locals.userId);

        res.status(StatusCode.Ok).json({
            message: `User ${user.id} fetched successfully`,
            user: user
        });
    }
);

UsersController.get(
    "/:userId",
    validateRouteParameter(usersIdDtoSchema),
    getUserFromToken,
    authorizeAccess(["admin"]),
    async function (_req, res) {
        const user = res.locals.user;

        res.status(StatusCode.Ok).json({
            message: `User profile ${user.id} fetched successfully`,
            user: user
        });
    }
);

UsersController.patch(
    "/:userId/role",
    validateRouteParameter(usersIdDtoSchema),
    validateRequestBody(usersRoleDtoSchema),
    getUserFromToken,
    authorizeAccess(["admin"]),
    async function (req, res) {
        const { userId } = getRouteParams<UsersIdDto>(req.params);

        const userWithUpdatedRole = await UsersService.changeUserRole(
            userId,
            req.body
        );

        res.status(StatusCode.Ok).json({
            message:
                `User ${userId} ` +
                (req.body.role == "admin" ? "promoted " : "demoted ") +
                "successfully",
            user: userWithUpdatedRole
        });
    }
);
