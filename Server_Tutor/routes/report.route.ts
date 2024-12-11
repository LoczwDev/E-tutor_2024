import Express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";
import {
  createReport,
  deleteReport,
  getAllReports,
  getReport,
} from "../controllers/report.controllers";

const reportRouter = Express.Router();

reportRouter.post(
  "/",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  createReport
);
reportRouter.get(
  "/",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  getAllReports
);

reportRouter.get(
  "/:reportId",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  getReport
);

reportRouter.delete(
  "/:reportId",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  deleteReport
);

export default reportRouter;
