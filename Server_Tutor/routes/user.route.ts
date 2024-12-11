import express from "express";
import {
  activateUser,
  addLectureNote,
  changeRoleUserByAdmin,
  deleteLectureNote,
  deleteUserByAdmin,
  getAllTutor,
  getAllUsersByAdmin,
  getLectureNotes,
  getProfileUser,
  getProfileUserByAdmin,
  getStuddentByTutor,
  getTeacherInfo,
  getTotalUserByType,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  toggleFavoriteCourse,
  updateAccessToken,
  updateLectureNote,
  updateListBlock,
  updateProfileAvatar,
  updateUserInfo,
  updateUserPassword,
} from "../controllers/user.controllers";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { completeLecture } from "../controllers/courses.controllers";
import { getAllQuizByUser } from "../controllers/quiz.controllers";
const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/activate-User", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAutheticated, logoutUser);

userRouter.get("/refresh", updateAccessToken);

userRouter.get(
  "/profileUser",
  updateAccessToken,
  isAutheticated,
  getProfileUser
);

userRouter.post("/socialAuth", socialAuth);

userRouter.put(
  "/updateUserInfo",
  updateAccessToken,
  isAutheticated,
  updateUserInfo
);

userRouter.put(
  "/updatePasswordUser",
  updateAccessToken,
  isAutheticated,
  updateUserPassword
);

userRouter.put(
  "/updateProfileAvatar",
  updateAccessToken,
  isAutheticated,
  updateProfileAvatar
);

userRouter.get(
  "/getAllUsersAdmin",
  isAutheticated,
  // updateAccessToken,
  // authorizeRoles("admin"),
  getAllUsersByAdmin
);

userRouter.put(
  "/changeRoleUser",
  isAutheticated,
  updateAccessToken,
  changeRoleUserByAdmin
);

userRouter.delete(
  "/deleteUser/:id",
  isAutheticated,
  updateAccessToken,
  // authorizeRoles("user"),
  deleteUserByAdmin
);

// Ghi chú
userRouter.get(
  "/courseNote",
  isAutheticated,
  updateAccessToken,
  getLectureNotes
);

userRouter.post(
  "/createNote",
  isAutheticated,
  updateAccessToken,
  addLectureNote
);

userRouter.put(
  "/updateNode",
  isAutheticated,
  updateAccessToken,
  updateLectureNote
);

userRouter.delete(
  "/deleteNote",
  isAutheticated,
  updateAccessToken,
  deleteLectureNote
);

userRouter.post(
  "/toggleFavorite",
  isAutheticated,
  updateAccessToken,
  toggleFavoriteCourse
);

userRouter.get("/teacher/:teacherId", getTeacherInfo);
userRouter.get("/getQuizsByUser", isAutheticated, updateAccessToken, getAllQuizByUser);
userRouter.get("/getProfileUserByAdmin/:userId", isAutheticated, updateAccessToken, getProfileUserByAdmin);
userRouter.put("/updateListBlock/:userId", isAutheticated, updateAccessToken, updateListBlock);
userRouter.get("/getTotalUserByType", isAutheticated, updateAccessToken, getTotalUserByType);
userRouter.get("/getStuddentByTutor", isAutheticated, updateAccessToken, getStuddentByTutor);
userRouter.get("/getAllTutor", isAutheticated, updateAccessToken, getAllTutor);


export default userRouter;
