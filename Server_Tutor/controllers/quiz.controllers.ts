import { CathAsynsError } from "../middleware/catchAsynsError";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import QuizModel from "../models/quiz.model";
import userModel from "../models/user.model";
import mongoose from "mongoose";
import PostModel from "../models/post.model";
import { redis } from "../utils/redis";

export const createQuiz = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizTitle, questions } = req.body;
      // Tạo bài kiểm tra mới
      const newQuiz = new QuizModel({ user: req.user, quizTitle, questions });
      await newQuiz.save();

      res.status(201).json({ success: true, quiz: newQuiz });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editQuiz = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const { quizTitle, questions } = req.body;

      // Tìm bài kiểm tra và cập nhật thông tin
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
      }

      quiz.quizTitle = quizTitle || quiz.quizTitle;
      quiz.questions = questions || quiz.questions;

      await quiz.save();
      res.status(200).json({ message: "Cập nhật thành công", quiz });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getQuiz = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Không tìm thấy" });
      }

      res.status(200).json({ quiz });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllQuiz = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quizs = await QuizModel.find();
      res.status(200).json({ quizs });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getAllQuizByUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: any = req.user?._id;
      const userRole: any = req.user?.role;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorHandler("Invalid User ID", 400));
      }

      let quizs;

      if (userRole === "admin") {
        quizs = await QuizModel.find();
      } else {
        quizs = await QuizModel.find({ user: userId });
      }

      res.status(200).json({ quizs });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getAllQuizByIds = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizIds } = req.query;
      console.log(quizIds);

      // Truy vấn các quiz có _id trong danh sách quizIds
      const quizs = await QuizModel.find({ _id: { $in: quizIds } });

      res.status(200).json({ quizs });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteQuiz = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;

      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Không tìm thấy" });
      }

      await quiz.deleteOne({ quizId });
      res.status(200).json({ message: "Xóa thành công " });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const submitQuiz = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId, answers } = req.body;
      const userId: any = req.user?._id;
      const quiz = await QuizModel.findById(quizId);

      if (!quiz) {
        return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
      }

      // Tính điểm bài kiểm tra
      let score = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          score++;
        }
      });

      // Lấy người dùng từ cơ sở dữ liệu
      const user: any = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      // Kiểm tra nếu người dùng đã làm bài kiểm tra này
      const existingResultIndex = user.resultsQuiz.findIndex(
        (result: any) => result.quiz.toString() === quizId
      );

      if (existingResultIndex !== -1) {
        // Cập nhật kết quả nếu đã tồn tại
        user.resultsQuiz[existingResultIndex] = {
          quiz: quizId,
          score,
          answers,
        };
      } else {
        // Thêm kết quả mới nếu chưa làm bài này trước đó
        user.resultsQuiz.push({
          quiz: quizId,
          score,
          answers,
        });
      }

      await user.save();
      await redis.set(user?._id, JSON.stringify(user), "EX", 6048000);

      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
