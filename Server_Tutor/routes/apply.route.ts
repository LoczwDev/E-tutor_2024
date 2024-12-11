import Express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";
import {
  createApply,
  deleteApply,
  getAllApply,
  getApplyById,
  updateStatus,
} from "../controllers/apply.controllers";

const applyRouter = Express.Router();

applyRouter.post(
  "/",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  createApply
);
applyRouter.get(
  "/",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  getAllApply
);

applyRouter.put(
  "/:applyId",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  updateStatus
);
applyRouter.get(
  "/:applyId",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  getApplyById
);

applyRouter.delete(
  "/:applyId",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  deleteApply
);
export default applyRouter;
