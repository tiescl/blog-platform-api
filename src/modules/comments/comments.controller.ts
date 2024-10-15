import { Router } from "express";
import {
    commentsCreateDtoSchema,
    CommentsIdDto,
    commentsIdDtoSchema
} from "./dto";
import {
    getRouteParams,
    validateRequestBody,
    validateRouteParameter
} from "shared/validators";
import { authorizeUser, getUserFromToken } from "shared/middlewares";
import { CommentsService } from "./comments.service";
import { StatusCode } from "shared/constants";

export const CommentsController = Router();

CommentsController.patch(
    "/:commentId",
    validateRouteParameter(commentsIdDtoSchema),
    validateRequestBody(commentsCreateDtoSchema),
    getUserFromToken,
    authorizeUser,
    async function (req, res) {
        const { commentId } = getRouteParams<CommentsIdDto>(req.params);

        const updatedComment = await CommentsService.updateComment(
            commentId,
            req.body
        );

        res.status(StatusCode.Ok).json({
            message: `Comment for Post [${updatedComment.blog_id}] updated successfully`,
            comment: updatedComment
        });
    }
);
