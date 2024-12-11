import { NextFunction, Request, Response } from "express";
import { CathAsynsError } from "../middleware/catchAsynsError";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/courses.model";
import NotificationModel from "../models/notification.model";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import mongoose from "mongoose";

// export const createComment = CathAsynsError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { desc, courseId, lectureId, parent, replyOnUser } = req.body;
//       const course: any = await CourseModel.findById(courseId);

//       if (!course) {
//         next(new ErrorHandler("Không tìm khóa học", 500));
//       }
//       if (parent) {
//         const isCheckComment = await CommentModel.findById(parent);
//         if (!isCheckComment) {
//           next(new ErrorHandler("Không tìm thấy bình luận", 500));
//         }
//       }
//       const lecture = course.curriculumData
//         .flatMap((item: any) => item.lectures)
//         .find((el: any) => el._id.toString() === lectureId);

//       const titleLecture = lecture?.title;
//       const newComment = {
//         user: req.user,
//         desc,
//         parent,
//         lectureId,
//         courseId,
//         replyOnUser,
//       };

//       let isCheckUser = false;
//       if (replyOnUser) {
//         isCheckUser = replyOnUser.toString() === req.user?._id;
//       }

//       const isCheckTutor: any = course.tutor?._id.toString() === req.user?._id;

//       if (!isCheckTutor) {
//         if (isCheckUser) {
//           await NotificationModel.findOneAndUpdate(
//             { receiverId: replyOnUser },
//             {
//               $push: {
//                 notification: {
//                   creatorId: req.user?._id,
//                   title: `${req.user?.fullName} đã trả lời`,
//                   message: `Bạn có một câu trả lời  mới từ ${titleLecture}`,
//                   status: "Chưa đọc",
//                   createdAt: new Date().toISOString(),
//                   updatedAt: new Date().toISOString(),
//                 },
//               },
//             },
//             { upsert: true, new: true }
//           );
//         } else {
//           await NotificationModel.findOneAndUpdate(
//             { receiverId: course.tutor._id },
//             {
//               $push: {
//                 notification: {
//                   creatorId: req.user?._id,
//                   title: "Bình luận mới",
//                   message: `Bạn có một bình luận mới từ khóa học: ${course.name}`,
//                   status: "Chưa đọc",
//                   createdAt: new Date().toISOString(),
//                   updatedAt: new Date().toISOString(),
//                 },
//               },
//             },
//             { upsert: true, new: true }
//           );
//         }
//       }

//       // Lưu bình luận mới

//       const comment = await CommentModel.create(newComment);

//       res.status(201).json({
//         success: true,
//         comment,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

export const createComment = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { desc, courseId, lectureId, postId, parent, replyOnUser } =
        req.body;

        if (req?.user?.listBlock?.commentblock) {
          return next(new ErrorHandler("Bạn bị cấm bình luân", 400));
        }

      // Check if the comment is for a course lecture
      let course: any = null;
      let post: any = null;
      let lecture: any = null;
      let titleLecture = null;

      if (courseId && lectureId) {
        course = await CourseModel.findById(courseId);

        if (!course) {
          return next(new ErrorHandler("Không tìm khóa học", 500));
        }

        lecture = course.curriculumData
          .flatMap((item: any) => item.lectures)
          .find((el: any) => el._id.toString() === lectureId);

        if (!lecture) {
          return next(new ErrorHandler("Không tìm thấy bài giảng", 500));
        }

        titleLecture = lecture?.title;
      }

      // Check if the comment is for a blog post
      if (postId) {
        post = await PostModel.findById(postId);

        if (!post) {
          return next(new ErrorHandler("Không tìm thấy bài viết", 500));
        }
      }

      // Validate parent comment if applicable
      if (parent) {
        const isCheckComment = await CommentModel.findById(parent);
        if (!isCheckComment) {
          return next(new ErrorHandler("Không tìm thấy bình luận", 500));
        }
      }

      const newComment = {
        user: req.user,
        desc,
        parent,
        lectureId,
        post,
        course,
        replyOnUser,
      };

      let isCheckUser = false;
      if (replyOnUser) {
        isCheckUser = replyOnUser.toString() === req.user?._id;
      }

      const isCheckTutor = course?.tutor?._id.toString() === req.user?._id;

      if (!isCheckTutor) {
        if (isCheckUser) {
          // Notification for replying to a user
          await NotificationModel.findOneAndUpdate(
            { receiverId: replyOnUser },
            {
              $push: {
                notification: {
                  creatorId: req.user,
                  title: `${req.user?.fullName} đã trả lời`,
                  message: `Bạn có một câu trả lời mới ${
                    titleLecture
                      ? `từ bài giảng: ${titleLecture}`
                      : `trên bài viết ${post.title}`
                  }`,
                  status: "Chưa đọc",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              },
            },
            { upsert: true, new: true }
          );
        } else if (course && course.tutor) {
          // Notification for course-related comments
          await NotificationModel.findOneAndUpdate(
            { receiverId: course.tutor._id },
            {
              $push: {
                notification: {
                  creatorId: req.user,
                  title: "Bình luận mới",
                  message: `Bạn có một bình luận mới ${
                    titleLecture
                      ? `từ bài giảng: ${titleLecture}`
                      : `trên bài viết của khóa học: ${course.name}`
                  }`,
                  status: "Chưa đọc",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              },
            },
            { upsert: true, new: true }
          );
        } else if (postId) {
          // Notification for post-related comments

          if (post && post.user) {
            await NotificationModel.findOneAndUpdate(
              { receiverId: post.user },
              {
                $push: {
                  notification: {
                    creatorId: req.user,
                    title: "Bình luận mới",
                    message: `Bạn có một bình luận mới trên bài viết của mình.`,
                    status: "Chưa đọc",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
              { upsert: true, new: true }
            );
          }
        }
      }

      // Save the new comment
      const comment = await CommentModel.create(newComment);

      res.status(201).json({
        success: true,
        comment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getCommentByLecture = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lectureId } = req.params;
      const comment = await CommentModel.find({
        lectureId: lectureId,
      }).populate("replies").sort({ createdAt: -1 });;

      res.status(200).json({
        success: true,
        comment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getCommentByPost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const comment = await CommentModel.find({
        post: new mongoose.Types.ObjectId(postId),
      }).populate("replies");

      res.status(200).json({
        success: true,
        comment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateComment = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { desc } = req.body;

      const comment = await CommentModel.findById(req.params.commentId);

      if (!comment) {
        const error = new Error("Khong tim thay Comment");
        return next(error);
      }
      comment.desc = desc || comment.desc;
      const update = await comment.save();

      res.status(200).json({
        success: true,
        update,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteComment = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment: any = await CommentModel.findByIdAndDelete(
        req.params.commentId
      );
      await CommentModel.deleteMany({ parent: comment._id });

      if (!comment) {
        const error = new Error("Khong tim thay Comment");
        return next(new ErrorHandler(error.message, 500));
      }

      return res.json({
        message: "Comment đã được xóa",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const blockComment = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment: any = await CommentModel.findById(req.params.commentId);

      comment.block = !comment?.block;
      const update = await comment.save();

      res.status(200).json({
        success: true,
        message: `Bình luận đã được ${comment?.block ? "khóa" : "bỏ khóa"}`,
        update,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
