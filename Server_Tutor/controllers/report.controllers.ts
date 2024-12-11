import { NextFunction, Request, Response } from "express";
import { CathAsynsError } from "../middleware/catchAsynsError";
import ErrorHandler from "../utils/ErrorHandler";
import CommentModel from "../models/comment.model";
import ReportModel from "../models/report.model";
import PostModel from "../models/post.model";
import CourseModal from "../models/courses.model";

export const createReport = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commentId, reason, postId, courseId, type } = req.body;

      const comment = await CommentModel.findById(commentId);
      const post = await PostModel.findById(postId);
      const course = await CourseModal.findById(courseId);

      const newReport = new ReportModel({
        user: req.user,
        reason,
        comment,
        post,
        course,
        type,
      });

      await newReport.save();

      res.status(201).json({ message: "Báo cáo thành công!" });
    } catch (error: any) {
      // Xử lý lỗi
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllReports = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await ReportModel.find()
        .populate("user")
        .populate("comment")
        .populate("course")
        .populate("post");

      res.status(200).json({
        success: true,
        reports,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getReport = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;
      const report = await ReportModel.findById(reportId)
        .populate({
          path: "user",
        })
        .populate({
          path: "comment",
          populate: {
            path: "user",
          },
        })
        .populate({
          path: "course",
          populate: {
            path: "tutor",
          },
        })
        .populate({
          path: "post",
          populate: {
            path: "user",
          },
        });

      res.status(200).json({
        success: true,
        report,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteReport = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;

      // Find and delete the report by ID
      const report = await ReportModel.findByIdAndDelete(reportId);
      res.status(200).json({
        success: true,
        message: "Xóa thành công",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
