import Express from "express";
import { isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";
import {
  createQuiz,
  deleteQuiz,
  editQuiz,
  getAllQuiz,

  getAllQuizByIds,

  getAllQuizByUser,

  getQuiz,
  submitQuiz,
} from "../controllers/quiz.controllers";

const quizRouter = Express.Router();

quizRouter.post("/", isAutheticated, updateAccessToken, createQuiz);
quizRouter.put("/:quizId", isAutheticated, updateAccessToken, editQuiz);
quizRouter.get("/", isAutheticated, updateAccessToken, getAllQuiz);
quizRouter.get("/getAllQuizByUser", isAutheticated, updateAccessToken, getAllQuizByUser);
quizRouter.get("/getAllQuizByIds", isAutheticated, updateAccessToken, getAllQuizByIds);
quizRouter.get("/:quizId", isAutheticated, updateAccessToken, getQuiz);
quizRouter.delete("/:quizId", isAutheticated, updateAccessToken, deleteQuiz);
quizRouter.post("/submit", isAutheticated, updateAccessToken, submitQuiz);

export default quizRouter;
