import Express from "express";
import { isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";
import {
  createPost,
  deletePost,
  editPost,
  getAllPost,
  getPostFavoriteByUser,
  getPostsByUser,
  getSignlePost,
  getViewPostAdmin,
  toggleFavoritePost,
  updateStatusByPost,
} from "../controllers/posts.controllers";

const postRouter = Express.Router();

postRouter.post("/createPost", isAutheticated, updateAccessToken, createPost);
postRouter.get(
  "/getPostsByUser",
  isAutheticated,
  updateAccessToken,
  getPostsByUser
);
postRouter.get("/getSignlePost/:postId", getSignlePost);
postRouter.get(
  "/getPostFavoriteByUser",
  isAutheticated,
  updateAccessToken,
  getPostFavoriteByUser
);
postRouter.get("/allPost", getAllPost);
postRouter.put(
  "/editPost/:postId",
  isAutheticated,
  updateAccessToken,
  editPost
);

postRouter.delete(
  "/deletePost/:postId",
  isAutheticated,
  updateAccessToken,
  deletePost
);
postRouter.put(
  "/toggleFavoritePost/:postId",
  isAutheticated,
  updateAccessToken,
  toggleFavoritePost
);

postRouter.put(
  "/updateStatusByPost/:postId",
  isAutheticated,
  updateAccessToken,
  updateStatusByPost
);
postRouter.get(
  "/getViewPostAdmin/:postId",
  isAutheticated,
  updateAccessToken,
  getViewPostAdmin
);
export default postRouter;
