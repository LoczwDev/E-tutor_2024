import { NextFunction, Request, Response } from "express";
import { CathAsynsError } from "../middleware/catchAsynsError";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/ErrorHandler";
import {
  createCourses,
  getAllCoursesService,
} from "../services/courses.service";
import CourseModel from "../models/courses.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendEmail";
import NotificationModel from "../models/notification.model";
import axios from "axios";
import userModel from "../models/user.model";
import OrderModel from "../models/orders.model";
import CommentModel from "../models/comment.model";

export const uploadCourse = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req?.user?.listBlock?.courseblock) {
        return next(new ErrorHandler("Bạn bị cấm tạo khóa học", 400));
      }
      const { courseData } = req.body;

      if (req.user) {
        const tutor = req.user;
        courseData.tutor = tutor;
      }

      // Handle thumbnail upload
      if (courseData.thumbnail) {
        const thumbnailUpload = await cloudinary.v2.uploader.upload(
          courseData.thumbnail,
          {
            folder: "courses",
          }
        );
        courseData.thumbnail = {
          public_id: thumbnailUpload.public_id,
          url: thumbnailUpload.secure_url,
          original_filename: thumbnailUpload.thumbnailUpload,
        };
      }

      // Handle trailer upload
      if (courseData.trailer) {
        const trailerUpload = await cloudinary.v2.uploader.upload(
          courseData.trailer,
          {
            folder: "trailers",
            resource_type: "video",
          }
        );
        courseData.trailer = {
          public_id: trailerUpload.public_id,
          url: trailerUpload.secure_url,
        };
      }

      if (Array.isArray(courseData.curriculumData)) {
        // Iterate over each curriculum section
        for (let i = 0; i < courseData.curriculumData.length; i++) {
          const curriculumSection = courseData.curriculumData[i];

          // Ensure lectures exists and is an array
          if (Array.isArray(curriculumSection.lectures)) {
            for (let j = 0; j < curriculumSection.lectures.length; j++) {
              const lecture = curriculumSection.lectures[j];

              // Upload video if present
              if (lecture.video) {
                const videoUpload = await cloudinary.v2.uploader.upload(
                  lecture.video,
                  {
                    folder: `videos`,
                    resource_type: "video",
                  }
                );
                lecture.video = {
                  public_id: videoUpload.public_id,
                  url: videoUpload.secure_url,
                  duration: lecture.duration,
                };
              }

              // Upload attachFile if present
              if (Array.isArray(lecture.attachFiles)) {
                const uploadedFiles = [];
                for (const file of lecture.attachFiles) {
                  const fileUpload = await cloudinary.v2.uploader.upload(file, {
                    folder: `raws`,
                  });
                  uploadedFiles.push({
                    public_id: fileUpload.public_id,
                    url: fileUpload.secure_url,
                    original_filename: fileUpload.original_filename,
                  });
                }
                lecture.attachFiles = uploadedFiles;
              }
            }
          } else {
            return next(new ErrorHandler("Lectures must be an array", 400));
          }
        }
      } else {
        return next(new ErrorHandler("Curriculum data must be an array", 400));
      }

      createCourses(courseData, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit courses

export const editCourses = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data } = req.body;

      const { thumbnail, trailer, curriculumData } = data;
      const courseId = req.params.id;

      const courseData = await CourseModel.findById(courseId);
      if (!courseData) {
        return next(new ErrorHandler("Không tìm thấy khóa học", 404));
      }

      if (
        thumbnail &&
        typeof thumbnail === "string" &&
        !thumbnail.startsWith("https")
      ) {
        if (courseData?.thumbnail?.public_id) {
          await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);
        }

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } else if (
        thumbnail &&
        typeof thumbnail === "string" &&
        thumbnail.startsWith("https")
      ) {
        data.thumbnail = courseData.thumbnail;
      }

      // Handle Trailer
      if (
        trailer &&
        typeof trailer === "string" &&
        !trailer.startsWith("https")
      ) {
        if (courseData.trailer?.public_id) {
          await cloudinary.v2.uploader.destroy(courseData.trailer.public_id);
        }

        const myCloud = await cloudinary.v2.uploader.upload(trailer, {
          folder: "courses",
          resource_type: "video",
        });
        data.trailer = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      } else if (
        trailer &&
        typeof trailer === "string" &&
        trailer.startsWith("https")
      ) {
        data.trailer = courseData.trailer;
      }

      // Handle Curriculum Data
      if (Array.isArray(curriculumData)) {
        for (let i = 0; i < curriculumData.length; i++) {
          const curriculumSection = curriculumData[i];

          if (Array.isArray(curriculumSection.lectures)) {
            for (let j = 0; j < curriculumSection.lectures.length; j++) {
              const lecture = curriculumSection.lectures[j];

              // Handle lecture video upload
              if (
                lecture.video &&
                typeof lecture.video === "string" &&
                !lecture.video.startsWith("https")
              ) {
                if (lecture?.video?.public_id) {
                  await cloudinary.v2.uploader.destroy(lecture.video.public_id);
                }

                const videoUpload = await cloudinary.v2.uploader.upload(
                  lecture.video,
                  {
                    folder: "videos",
                    resource_type: "video",
                  }
                );
                lecture.video = {
                  public_id: videoUpload.public_id,
                  url: videoUpload.secure_url,
                  duration: lecture.duration,
                };
              } else if (
                lecture.video &&
                typeof lecture.video === "string" &&
                lecture.video.startsWith("https")
              ) {
                data.curriculumData[i].lectures[j].video =
                  courseData.curriculumData[i].lectures[j].video;
              }

              // Handle attached files
              if (
                Array.isArray(lecture.attachFiles) &&
                lecture.attachFiles.length > 0
              ) {
                const existingFiles =
                  courseData.curriculumData[i].lectures[j].attachFiles || [];
                let uploadedFiles: any = [...existingFiles]; // Start with existing files

                for (const file of lecture.attachFiles) {
                  // Check if the file needs to be removed
                  if (
                    file.url &&
                    typeof file.url === "string" &&
                    file.url.startsWith("https")
                  ) {
                    const newFileIds = new Set(
                      lecture.attachFiles.map((file: any) => file.public_id)
                    );

                    // Find and remove the file to delete
                    for (const existingFile of uploadedFiles) {
                      if (!newFileIds.has(existingFile.public_id)) {
                        // Remove the file from Cloudinary
                        await cloudinary.v2.uploader.destroy(
                          existingFile.public_id
                        );

                        // Filter out the file from uploadedFiles
                        uploadedFiles = uploadedFiles.filter(
                          (file: any) =>
                            file.public_id !== existingFile.public_id
                        );
                      }
                    }
                  }
                  if (
                    file.url &&
                    typeof file.url === "string" &&
                    !file.url.startsWith("https")
                  ) {
                    // Now upload the new file
                    const fileUpload = await cloudinary.v2.uploader.upload(
                      file.url,
                      {
                        folder: "raws",
                      }
                    );
                    uploadedFiles.push({
                      public_id: fileUpload.public_id,
                      url: fileUpload.secure_url,
                      original_filename: file.original_filename,
                    });
                  }
                }
                lecture.attachFiles = uploadedFiles;
              }
            }
          } else {
            return next(
              new ErrorHandler(
                "Lỗi, có thể bài giảng không phải là một đối tượng đúng",
                400
              )
            );
          }
        }
      }

      // Update the course
      const updatedCourse = await CourseModel.findOneAndUpdate(
        { _id: courseId },
        { $set: data },
        { new: true }
      );

      if (updatedCourse) {
        await updatedCourse.save();
      }

      res.status(200).json({
        success: true,
        course: updatedCourse,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// get courses single

export const getSingleCourse = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId: any = req.params.id;
      const course = await CourseModel.findById(courseId)
        .populate({
          path: "reviews", // Trường cần populate
          populate: {
            path: "user", // Trường con cần populate trong mỗi revie
          },
        })
        .populate("tutor"); // Populate tutor nếu cần

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all courses

export const getAllCourses = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        limit,
        keyword,
        priceMin,
        priceMax,
        subCategory,
        durationMin,
        durationMax,
        ratings,
        level,
        sortBy,
      } = req.query;

      const filter: any = {};

      const options: any = {
        page: Number(page),
        limit: Number(limit),
      };

      // Function to remove accents from Vietnamese text
      const removeAccents = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };

      // Normalize the keyword for better matching
      const normalizedKeyword =
        typeof keyword === "string" ? removeAccents(keyword.trim()) : "";

      // Full-text search replacement for Vietnamese
      if (normalizedKeyword) {
        filter.$or = [
          { name: { $regex: new RegExp(normalizedKeyword, "i") } },
          { desc: { $regex: new RegExp(normalizedKeyword, "i") } },
          { topic: { $regex: new RegExp(normalizedKeyword, "i") } },
        ];
      }

      // Price filtering
      if (priceMin || priceMax) {
        filter.price = {};
        if (priceMin) filter.price.$gte = Number(priceMin);
        if (priceMax) filter.price.$lte = Number(priceMax);
      }

      // Subcategory filtering
      if (subCategory) {
        filter.subCategory = subCategory;
      }

      // Duration filtering
      if (durationMin || durationMax) {
        filter.durations = {};
        if (durationMin) filter.durations.$gte = Number(durationMin);
        if (durationMax) filter.durations.$lte = Number(durationMax);
      }

      if (ratings !== undefined) {
        if (Number(ratings) >= 0) {
          filter.ratings = { $gte: Number(ratings) };
        }
      }

      // Level filtering
      if (level) {
        filter.level = level;
      }
      filter.status = "Hoạt động";

      // Sorting logic
      const sortOptions: any = {};
      if (sortBy === "price-asc") {
        sortOptions.price = 1;
      } else if (sortBy === "price-desc") {
        sortOptions.price = -1;
      } else if (sortBy === "Top Rated") {
        sortOptions.purchased = -1;
      } else {
        sortOptions.createdAt = -1;
      }

      // Fetching the courses
      const courses = await CourseModel.find(filter)
        .populate("tutor")
        .sort(sortOptions) // Apply sorting
        .limit(options.limit)
        .skip((options.page - 1) * options.limit)
        .exec();

      res.status(200).json({
        success: true,
        page: options.page,
        limit: options.limit,
        courses,
      });
    } catch (error: any) {
      console.error("Error retrieving courses:", error);
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// get courses content by user

export const getCoursesContentByUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCoursesList = req.user?.progress;
      const courseId = req.params.id;
      const coursesExits = userCoursesList?.find(
        (course: any) => course.courseId.toString() === courseId
      );

      if (!coursesExits) {
        next(new ErrorHandler("Bạn đã khóa học này", 500));
      }

      const course = await CourseModel.findById(courseId).populate("students");
      const content = course;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllPurchasedCourses = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCoursesList = req.user?.progress;

      if (!userCoursesList || userCoursesList.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Bạn chưa mua khóa học nào.",
          courses: [],
        });
      }

      // Extract course IDs from the user's progress
      const courseIds = userCoursesList.map((course: any) => course.courseId);

      // Get search, sort, pagination (page, limit) parameters from the request
      const { name, sortBy, page = 1, limit = 10 } = req.query;

      // Build the query to search and filter
      let query: any = { _id: { $in: courseIds } };

      // Search by course name (if provided)
      if (name) {
        query.name = { $regex: name, $options: "i" }; // Case-insensitive search
      }

      // Sorting logic
      let sortQuery: any = {};
      if (sortBy === "nameAsc") {
        sortQuery.name = 1; // Sort by name in ascending order
      } else if (sortBy === "nameDesc") {
        sortQuery.name = -1; // Sort by name in descending order
      }

      // Pagination logic: skip and limit
      const skip = (Number(page) - 1) * Number(limit);

      // Get total count of courses for pagination
      const totalCourses = await CourseModel.countDocuments(query);
      const totalPages = Math.ceil(totalCourses / Number(limit));

      // Fetch purchased courses based on the query with pagination and sorting
      const purchasedCourses = await CourseModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort(sortQuery);

      // Respond with paginated courses
      res.status(200).json({
        success: true,
        courses: purchasedCourses,
        totalPages: totalPages,
        currentPage: Number(page),
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// create Question content courses
interface AddQuestionDataBody {
  question: string;
  courseId: string;
  contentId: string;
}

export const createQuestion = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: AddQuestionDataBody = req.body;
      const course = await CourseModel.findById(courseId);
      // console.log(req.user);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        next(new ErrorHandler("Không có dữ liệu khóa học", 500));
      }
      const courseContent = course?.curriculumData?.find((item: any) =>
        item.lectures.some((lecture: any) => lecture._id.equals(contentId))
      );

      if (!courseContent) {
        next(new ErrorHandler("Không có dữ liệu khóa học", 500));
      }

      const lecture = courseContent?.lectures.find((lecture: any) =>
        lecture._id.equals(contentId)
      );

      if (!lecture) {
        return next(new ErrorHandler("Không tìm thấy bài giảng", 404));
      }

      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      lecture?.questions.push(newQuestion);

      await course?.save();

      await NotificationModel.create({
        userId: req.user?._id,
        title: "Câu hỏi mới",
        message: `Bạn có một câu hỏi mới từ ${lecture?.title}`,
        status: "Chưa đọc",
      });

      res.status(200).json({
        success: true,
        message: "Thêm câu hỏi thành công",
        course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// add answer questions

interface AddAnswerBody {
  answer: string;
  contentId: string;
  courseId: string;
  questionId: string;
}

export const addAnswer = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, questionId, courseId, contentId }: AddAnswerBody =
        req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Không có dữ liệu khóa học", 400));
      }

      const courseContent = course?.curriculumData?.find((item: any) =>
        item.lectures.some((lecture: any) => lecture._id.equals(contentId))
      );

      if (!courseContent) {
        return next(new ErrorHandler("Không có dữ liệu khóa học", 400));
      }

      const lecture = courseContent?.lectures.find((lecture: any) =>
        lecture._id.equals(contentId)
      );

      if (!lecture) {
        return next(new ErrorHandler("Không tìm thấy bài giảng", 404));
      }

      const question = lecture.questions.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!question) {
        return next(new ErrorHandler("Không có dữ liệu câu hỏi", 400));
      }

      const newAnswer: any = {
        user: req.user,
        answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      question?.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user?._id === question?.user?._id) {
        // create A thongbao

        await NotificationModel.create({
          userId: req.user?._id,
          title: "Trả lời câu hỏi",
          message: `Câu hỏi của bạn đã được trả lời ${courseContent?.title}`,
          status: "Chưa đọc",
        });
      } else {
        const data = {
          name: question?.user.lastName,
          title: courseContent?.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/questionReply.ejs"),
          data
        );

        try {
          if (question?.user.email) {
            sendMail({
              email: question.user.email,
              subject: "Trả lời câu hỏi",
              template: "questionReply.ejs",
              data,
            });
          } else {
            return next(
              new ErrorHandler("Không tìm thấy email của người dùng", 400)
            );
          }
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 400));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// add ratting add course
interface ReviewBody {
  review: string;
  rating: number;
}

export const addReview = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { review, rating }: ReviewBody = req.body;

      const courseList = req.user?.progress;
      const courseId = req.params.courseId;
      const userId = req.user?._id as string;

      // Check if the course is in the user's progress list
      const courseByRatting = courseList?.some(
        (item: any) => item.courseId.toString() === courseId.toString()
      );

      if (!courseByRatting) {
        return next(new ErrorHandler("Không tìm thấy dữ liệu khóa học", 400));
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Không tìm thấy khóa học", 404));
      }

      // Check if the user has already reviewed this course
      const existingReviewIndex = course.reviews.findIndex(
        (item: any) =>
          item.user.toString() === userId ||
          item.user._id?.toString() === userId
      );

      if (existingReviewIndex !== -1) {
        // If review exists, update the existing review
        course.reviews[existingReviewIndex].rating = rating;
        course.reviews[existingReviewIndex].comment = review;
      } else {
        // If review doesn't exist, push a new review
        const reviewData: any = {
          user: req.user,
          rating,
          comment: review,
        };
        course.reviews.push(reviewData);
      }

      // Recalculate the average rating
      let avg = 0;
      course.reviews.forEach((item: any) => {
        avg += item.rating;
      });
      course.ratings = avg / course.reviews.length;

      // Save the updated course

      const idTutor: any = course?.tutor?._id;

      // Notify
      const isCheckUser: any = idTutor.toString() === req.user?._id;
      if (isCheckUser) {
        return next(
          new ErrorHandler(
            "Không nên tự ái kỷ đánh giá khóa học của mình chứ",
            404
          )
        );
      } else {
        await NotificationModel.findOneAndUpdate(
          { receiverId: course.tutor._id },
          {
            $push: {
              notification: {
                creatorId: req.user,
                title: "Đánh giá mới",
                message: `Bạn có một đánh giá ${rating} sao mới từ khóa học: ${course.name}`,
                status: "Chưa đọc",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          },
          { upsert: true, new: true }
        );
      }
      await course.save();

      // Send the response
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// add reply Review

interface ReplyReviewBody {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyReview = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId }: ReplyReviewBody = req.body;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        next(new ErrorHandler("Không tìm thấy khóa học", 400));
      }

      const review = course?.reviews?.find(
        (item: any) => item._id.toString() === reviewId
      );

      if (!review) {
        next(new ErrorHandler("Không tìm thấy khóa học", 400));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };
      // Đảm bảo rằng `commentReplies` tồn tại và là một mảng
      // lõio lỏ typeSript
      // if (!review?.commentReplies) {
      //   review.commentReplies = [];
      // }

      review?.commentReplies.push(replyData);
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
// getALl Admin
export const getAllCoursesByAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete course admin

export const deleteCourse = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new ErrorHandler("Không tìm thấy khóa học", 500));
      }
      await course.deleteOne({ id });
      await redis.del(id);

      res.status(201).json({
        success: true,
        message: `Xóa khóa học ${course?.name} thành công `,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const generateVideoUrl = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.body;
      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        { ttl: 300 },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const completeLecture = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, completedLectureId } = req.body;

      const user = await userModel.findById(req?.user?._id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Không tìm thấy khóa học" });
      }

      // Tìm tiến trình của người dùng cho khóa học cụ thể này
      const progressEntry = user.progress.find(
        (p: any) => p.courseId === courseId
      );
      if (!progressEntry) {
        return res
          .status(400)
          .json({ message: "Người dùng chưa bắt đầu khóa học này" });
      }

      // Tìm bài giảng hiện tại và bài giảng tiếp theo
      const allLectures = course.curriculumData.flatMap(
        (curriculum) => curriculum.lectures
      );

      const lectureIndex = allLectures.findIndex(
        (lecture) =>
          lecture._id && lecture._id.toString() === completedLectureId
      );

      if (lectureIndex === -1) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy bài giảng trong khóa học" });
      }

      // Thêm bài giảng đã hoàn thành và mở khóa bài giảng tiếp theo
      if (!progressEntry.completedLectures.includes(completedLectureId)) {
        progressEntry.completedLectures.push(completedLectureId);
      }

      const nextLecture = allLectures[lectureIndex + 1];
      if (nextLecture && nextLecture._id) {
        progressEntry.currentLecture = nextLecture._id.toString();
      } else {
        progressEntry.currentLecture = "completed";
      }

      // Tính toán phần trăm tiến trình
      const totalLectures = allLectures.length;
      progressEntry.percentNumber =
        (progressEntry.completedLectures.length / totalLectures) * 100;

      // Lưu tiến trình của người dùng
      await user.save();
      const userId = req.user?._id as string;
      await redis.set(userId, JSON.stringify(user), "EX", 6048000);

      res.status(200).json({
        message: nextLecture
          ? "Đã mở khóa bài giảng tiếp theo"
          : "Khóa học đã hoàn thành, bạn có thể bắt đầu làm bài tập",
        nextLecture: nextLecture ? nextLecture._id : null,
        percentCompleted: progressEntry.percentNumber,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getViewCourseAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;

      const user: any = req.user;
      if (!courseId) {
        return next(new ErrorHandler("courseId không được để trống", 400));
      }

      const totalComment = await CommentModel.countDocuments({ courseId });

      const course: any = await CourseModel.findById(courseId).populate(
        "tutor"
      );

      let totalLecture = 0;
      if (course.curriculumData && Array.isArray(course.curriculumData)) {
        totalLecture = course.curriculumData.reduce(
          (total: any, section: any) => {
            if (section.lectures && Array.isArray(section.lectures)) {
              return total + section.lectures.length;
            }
            return total;
          },
          0
        );
      }

      // Lấy danh sách các orders chứa courseId
      const orders = await OrderModel.find({
        courses: { $elemMatch: { _id: new mongoose.Types.ObjectId(courseId) } },
      });

      console.log(orders);

      // Tính tổng amount đã thanh toán từ payment_info
      let totalPaid = 0;
      if (orders) {
        totalPaid = orders.reduce((total, order) => {
          // Check if the user is an admin and use amountAdmin, otherwise use amountTutor
          const amount =
            user?.role === "admin" &&
            typeof order.amountAdmin === "number" &&
            !isNaN(order.amountAdmin)
              ? order.amountAdmin
              : typeof order.amountTutor === "number" &&
                !isNaN(order.amountTutor)
              ? order.amountTutor
              : 0;

          return total + amount;
        }, 0);
      }

      const students = await userModel.find({
        "progress.courseId": courseId,
      });

      // Map over each student to include their progress and reviews for the course
      const studentProgressWithReviews = students.map((student: any) => {
        // Find the student's progress in the course
        const progress = student.progress.find(
          (p: any) => p.courseId === courseId
        );

        // Find reviews by the specific student within the course's reviews array
        const studentReview = course.reviews.find(
          (review: any) => review.user._id.toString() === student._id.toString()
        );

        return {
          student: student,
          percentNumber: progress ? progress.percentNumber : "0",
          review: studentReview || null,
        };
      });

      return res.status(200).json({
        success: true,
        course,
        totalPaid,
        orders,
        totalComment,
        totalLecture,
        studentsByCourse: studentProgressWithReviews,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllCourseByTutor = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req?.user?._id;
      const userRole = req?.user?.role;

      let courses;

      if (userRole === "admin") {
        // Admin users: exclude courses with "Nháp" or "Đã xóa" status
        courses = await CourseModel.find({
          status: { $nin: ["Nháp", "Đã xóa"] },
        }).populate("tutor");
      } else {
        // Non-admin users: show only courses that belong to them and exclude "Đã xóa" status
        courses = await CourseModel.find({
          tutor: userId,
          status: { $ne: "Đã xóa" },
        }).populate("tutor");
      }

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// export const changeStatusByCourses = CathAsynsError(

//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseIds, status } = req.body;

//       if (!Array.isArray(courseIds) || courseIds.length === 0) {
//         return next(
//           new ErrorHandler("Vui lòng cung cấp mảng ID của các khóa học.", 400)
//         );
//       }

//       if (!status) {
//         return next(new ErrorHandler("Vui lòng cung cấp trạng thái.", 400));
//       }

//       // Cập nhật trạng thái cho các khóa học có ID trong mảng
//       const result = await CourseModel.updateMany(
//         { _id: { $in: courseIds } }, // Lọc các khóa học theo ID được cung cấp
//         { $set: { status } } // Cập nhật trường trạng thái
//       );

//       if (result.matchedCount === 0) {
//         return next(
//           new ErrorHandler("Không tìm thấy khóa học nào để cập nhật.", 404)
//         );
//       }

//       res.status(200).json({
//         success: true,
//         message: `Cập nhật trạng thái thành công cho ${result.modifiedCount} khóa học.`,
//         result,
//       });
//     } catch (error: any) {
//       next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

export const changeStatusByCourses = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseIds, status } = req.body;

      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return next(
          new ErrorHandler("Vui lòng cung cấp mảng ID của các khóa học.", 400)
        );
      }

      if (!status) {
        return next(new ErrorHandler("Vui lòng cung cấp trạng thái.", 400));
      }

      // Tạo đối tượng cập nhật với trường `deletedAt` nếu trạng thái là 'deleted'
      const updateData: any = { status };
      if (status === "Đã xóa") {
        updateData.deletedAt = new Date(); // Gán thời gian hiện tại
      }

      // Cập nhật trạng thái cho các khóa học có ID trong mảng
      const result = await CourseModel.updateMany(
        { _id: { $in: courseIds } }, // Lọc các khóa học theo ID được cung cấp
        { $set: updateData } // Cập nhật trường trạng thái và `deletedAt` nếu cần
      );

      if (result.matchedCount === 0) {
        return next(
          new ErrorHandler("Không tìm thấy khóa học nào để cập nhật.", 404)
        );
      }

      res.status(200).json({
        success: true,
        message: `Cập nhật trạng thái thành công cho ${result.modifiedCount} khóa học.`,
        result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

export const changeStatusCourse = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, status } = req.body;

      if (!status) {
        return next(new ErrorHandler("Vui lòng cung cấp trạng thái.", 400));
      }

      // Cập nhật trạng thái cho các khóa học có ID trong mảng
      const result = await CourseModel.updateMany(
        { _id: courseId }, // Lọc các khóa học theo ID được cung cấp
        { $set: { status } } // Cập nhật trường trạng thái
      );

      if (result.matchedCount === 0) {
        return next(
          new ErrorHandler("Không tìm thấy khóa học nào để cập nhật.", 404)
        );
      }

      res.status(200).json({
        success: true,
        message: `Cập nhật trạng thái thành công cho khóa học.`,
        result,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getTotalCourseByStatus = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      let totalCourses;
      let totalActive;
      let totalHidden;
      let totalPending;

      if (user?.role === "admin") {
        totalCourses = await CourseModel.countDocuments({
          status: { $nin: ["Nháp"] },
        });

        totalActive = await CourseModel.countDocuments({
          status: "Hoạt động",
        });

        totalHidden = await CourseModel.countDocuments({
          status: "Ẩn",
        });

        totalPending = await CourseModel.countDocuments({
          status: "Chờ duyệt",
        });
      } else if (user?.role === "tutor") {
        // Nếu là tutor, đếm số lượng khóa học của tutor đó theo từng trạng thái
        totalCourses = await CourseModel.countDocuments({
          tutor: user._id,
          status: { $nin: ["Nháp"] },
        });

        totalActive = await CourseModel.countDocuments({
          tutor: user._id,
          status: "Hoạt động",
        });

        totalHidden = await CourseModel.countDocuments({
          tutor: user._id,
          status: "Ẩn",
        });

        totalPending = await CourseModel.countDocuments({
          tutor: user._id,
          status: "Chờ duyệt",
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied: Unauthorized user role",
        });
      }

      res.status(200).json({
        success: true,
        totalCourses,
        totalActive,
        totalHidden,
        totalPending,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
