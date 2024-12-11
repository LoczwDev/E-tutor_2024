import express from "express";
import {
  addAnswer,
  addReplyReview,
  addReview,
  changeStatusByCourses,
  changeStatusCourse,
  completeLecture,
  createQuestion,
  deleteCourse,
  editCourses,
  generateVideoUrl,
  getAllCourseByTutor,
  getAllCourses,
  getAllCoursesByAdmin,
  getAllPurchasedCourses,
  getCoursesContentByUser,
  getSingleCourse,
  getTotalCourseByStatus,
  getViewCourseAdmin,
  uploadCourse,
} from "../controllers/courses.controllers";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";

const coursesRouter = express.Router();

coursesRouter.post(
  "/upload",
  isAutheticated,
  // authorizeRoles("admin"),
  updateAccessToken,
  uploadCourse
);
coursesRouter.put(
  "/edit-course/:id",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  editCourses
);
coursesRouter.get("/singleCourse/:id", getSingleCourse);
coursesRouter.get("/", getAllCourses);
coursesRouter.get(
  "/contentCoursesByUser/:id",
  isAutheticated,
  updateAccessToken,
  getCoursesContentByUser
);
coursesRouter.get(
  "/allCoursePurchased",
  isAutheticated,
  updateAccessToken,
  getAllPurchasedCourses
);
coursesRouter.put(
  "/createQuesion",
  isAutheticated,
  updateAccessToken,
  createQuestion
);
coursesRouter.put("/addAnwser", isAutheticated, updateAccessToken, addAnswer);
coursesRouter.put(
  "/addReview/:courseId",
  isAutheticated,
  updateAccessToken,
  addReview
);
coursesRouter.put(
  "/replyReview",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  addReplyReview
);

coursesRouter.get(
  "/getAllCoursesAdmin",
  isAutheticated,
  // authorizeRoles("admin"),
  getAllCoursesByAdmin
);

coursesRouter.post("/getVideoOtp", generateVideoUrl);

coursesRouter.delete(
  "/deleteCourse/:id",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("admin"),
  deleteCourse
);

coursesRouter.put(
  "/completeLecture",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  completeLecture
);

coursesRouter.get(
  "/getViewCourseAdmin/:courseId",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  getViewCourseAdmin
);

coursesRouter.get(
  "/getAllCourseByTutor",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  getAllCourseByTutor
);

coursesRouter.put(
  "/changeStatusByCourses",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  changeStatusByCourses
);

coursesRouter.get(
  "/getTotalCourseByStatus",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  getTotalCourseByStatus
);
coursesRouter.put(
  "/changeStatusCourse",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  changeStatusCourse
);
export default coursesRouter;
