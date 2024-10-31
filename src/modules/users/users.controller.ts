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
