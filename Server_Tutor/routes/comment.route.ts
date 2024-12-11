import Express from "express";
import { isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";
import {
  blockComment,
  createComment,
  deleteComment,
  getCommentByLecture,
  getCommentByPost,
  updateComment,
} from "../controllers/comment.controllers";
const commentRouter = Express.Router();

commentRouter.post(
  "/createComment",
  isAutheticated,
  updateAccessToken,
  createComment
);

commentRouter.get(
  "/getCommentByLecture/:lectureId",
  isAutheticated,
  updateAccessToken,
  getCommentByLecture
);
commentRouter.get(
  "/getCommentByPost/:postId",
  isAutheticated,
  updateAccessToken,
  getCommentByPost
);

commentRouter.put(
  "/editComment/:commentId",
  isAutheticated,
  updateAccessToken,
  updateComment
);
commentRouter.delete(
  "/deleteComment/:commentId",
  isAutheticated,
  updateAccessToken,
  deleteComment
);
commentRouter.put(
  "/blockComment/:commentId",
  isAutheticated,
  updateAccessToken,
  blockComment
);

export default commentRouter;
