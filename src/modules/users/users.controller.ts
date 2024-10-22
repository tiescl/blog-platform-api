import { Router } from "express";
import { UsersService } from "./users.service";
import { authorizeAccess, getUserFromToken } from "shared/middlewares";
import { getRouteParams, validateRouteParameter } from "shared/validators";
import { UsersIdDto, usersIdDtoSchema } from "./dto";
import { StatusCode } from "shared/constants";

export const UsersController = Router();

UsersController.patch(
    "/:userId/promote",
    validateRouteParameter(usersIdDtoSchema),
    getUserFromToken,
    authorizeAccess(["admin"]),
    async function (req, res) {
        const { userId } = getRouteParams<UsersIdDto>(req.params);

        const promotedUser = await UsersService.changeUserRole(
            userId,
            "admin"
        );

        res.status(StatusCode.Ok).json({
            message: `User ${userId} promoted successfully`,
            user: promotedUser
        });
    }
);

UsersController.patch(
    "/:userId/demote",
    validateRouteParameter(usersIdDtoSchema),
    getUserFromToken,
    authorizeAccess(["admin"]),
    async function (req, res) {
        const { userId } = getRouteParams<UsersIdDto>(req.params);

        const demotedUser = await UsersService.changeUserRole(
            userId,
            "user"
        );

        res.status(StatusCode.Ok).json({
            message: `User ${userId} demoted successfully`,
            user: demotedUser
        });
    }
);
