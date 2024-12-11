import { NextFunction, Request, Response } from "express";
import { CathAsynsError } from "../middleware/catchAsynsError";
import UserModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/courses.model";
import { getAllOrdersService, newOrder } from "../services/orders.service";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendEmail";
import NotificationModel from "../models/notification.model";
import { redis } from "../utils/redis";
import OrderModel from "../models/orders.model";
import CategoryModel from "../models/category.model";
import mongoose from "mongoose";

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");

interface Order extends Document {
  courseId: string;
  userId: string;
  payment_info: object;
  emailOrder: string;
}

// export const createOrder = CathAsynsError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseId, payment_info, emailOrder } = req.body as Order;
//       const user = await UserModel.findById(req.user?._id);

//       if (payment_info) {
//         if ("id" in payment_info) {
//           const paymentIntentId = payment_info.id;
//           const paymentIntent = await stripe.paymentIntents.retrieve(
//             paymentIntentId
//           );
//           if (paymentIntent.status !== "succeeded") {
//             return next(new ErrorHandler("Khong tim thay authorized", 400));
//           }
//         }
//       }

//       if (!user) {
//         return next(new ErrorHandler("Không tìm thấy tài khoản", 404));
//       }

//       const courseExistInUser = user.progress.some((item: any) => {
//         return item.courseId && item.courseId.toString() === courseId;
//       });

//       if (courseExistInUser) {
//         return next(new ErrorHandler("Bạn đã mua khóa học này", 400));
//       }

//       const course: any = await CourseModel.findById(courseId);
//       if (!course) {
//         return next(new ErrorHandler("Không tìm thấy khóa học", 404));
//       }

//       const data: any = {
//         course: course,
//         userId: user._id,
//         payment_info,
//         emailOrder: emailOrder,
//       };
//       const fullNameUser: any = user?.fullName
//         ? user?.fullName
//         : user?.lastName;

//       const mailData = {
//         order: {
//           _id: course._id,
//           name: course.name,
//           thumbnail: course.thumbnail.url,
//           nameTutor: course.tutor.fullName,
//           lastNameStudent: user?.lastName,
//           nameStudent: fullNameUser,
//           price:
//             course.estimatedPrice != 0 ? course.estimatedPrice : course.price,
//           date: new Date().toLocaleDateString("vi-VN", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           }),
//         },
//       };

//       // Render email template
//       const html = await ejs.renderFile(
//         path.join(__dirname, "../mails/orderComfirm.ejs"),
//         mailData
//       );

//       // Send confirmation email
//       try {
//         if (user) {
//           await sendMail({
//             email: emailOrder,
//             subject: "Bạn có đơn hàng mới từ E-tutor",
//             template: "orderComfirm.ejs",
//             data: mailData,
//           });
//         }
//       } catch (error: any) {
//         return next(new ErrorHandler(error.message, 500));
//       }
//       const currentLecture = course.curriculumData[0].lectures[0]._id;

//       if (!course) {
//         return next(new ErrorHandler("Không tìm thấy mã khóa học", 400));
//       } else {
//         user.progress.push({
//           courseId: courseId,
//           startCourse: false, // hoặc true nếu khóa học đã bắt đầu
//           endCourse: false, // hoặc true nếu khóa học đã hoàn thành
//           completedLectures: [],
//           currentLecture: currentLecture.toString(),
//           percentNumber: 0,
//           lectureNote: [], // hoặc thêm các ghi chú bài giảng nếu có
//         });
//       }

//       const userId = req.user?._id as string;
//       await redis.set(userId, JSON.stringify(user));

//       await user?.save();

//       // Create notification
//       await NotificationModel.findOneAndUpdate(
//         { receiverId: course.tutor._id },
//         {
//           $push: {
//             notification: {
//               creatorId: userId,
//               title: "Thanh toán mới",
//               message: `Bạn có một đơn hàng mới từ ${course.name}`,
//               status: "Chưa đọc",
//             },
//           },
//         },
//         { upsert: true, new: true }
//       );

//       course.purchased = (course.purchased || 0) + 1;
//       course.students.push(req.user);

//       await redis.set(courseId, JSON.stringify(course), "EX", 604800);

//       await course?.save();

//       newOrder(data, res, next);
//     } catch (error: any) {
//       next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// export const createOrder = CathAsynsError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseIds, payment_info, emailOrder, amount } = req.body as {
//         courseIds: string[];
//         payment_info: any;
//         emailOrder: string;
//         amount: string;
//       };
//       const user = await UserModel.findById(req.user?._id);

//       if (!user) {
//         return next(new ErrorHandler("Không tìm thấy tài khoản", 404));
//       }

//       if (payment_info) {
//         if ("id" in payment_info) {
//           const paymentIntentId = payment_info.id;
//           const paymentIntent = await stripe.paymentIntents.retrieve(
//             paymentIntentId
//           );
//           if (paymentIntent.status !== "succeeded") {
//             return next(new ErrorHandler("Không tìm thấy authorized", 400));
//           }
//         }
//       }

//       const fullNameUser: any = user?.fullName
//         ? user?.fullName
//         : user?.lastName;

//       const courses = [];
//       const mailOrders: any = {
//         lastNameStudent: user?.lastName,
//         nameStudent: fullNameUser,
//         emailStudent: emailOrder,
//         amount: amount,
//         dataCourses: [],
//         date: new Date().toLocaleDateString("vi-VN", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//       };

//       for (const courseId of courseIds) {
//         // Kiểm tra nếu khóa học đã tồn tại trong progress của người dùng
//         const courseExistInUser = user.progress.some((item: any) => {
//           return item.courseId && item.courseId.toString() === courseId;
//         });

//         if (courseExistInUser) {
//           return next(
//             new ErrorHandler(`Bạn đã mua khóa học với ID ${courseId}`, 400)
//           );
//         }

//         // Tìm khóa học
//         const course: any = await CourseModel.findById(courseId);
//         if (!course) {
//           return next(
//             new ErrorHandler(`Không tìm thấy khóa học với ID ${courseId}`, 404)
//           );
//         }

//         // Thêm vào danh sách khóa học để lưu vào order
//         courses.push(course);
//         console.log("pushCourse");

//         // Tạo dữ liệu email cho từng khóa học
//         mailOrders?.dataCourses.push({
//           _id: course._id,
//           name: course.name,
//           thumbnail: course.thumbnail.url,
//           nameTutor: course.tutor.fullName,
//           price:
//             course.estimatedPrice != 0 ? course.estimatedPrice : course.price,
//           date: new Date().toLocaleDateString("vi-VN", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           }),
//         });

//         const currentLecture = course.curriculumData[0].lectures[0]._id;

//         // Cập nhật progress của user cho khóa học
//         user.progress.push({
//           courseId: courseId,
//           startCourse: false,
//           endCourse: false,
//           completedLectures: [],
//           currentLecture: currentLecture.toString(),
//           percentNumber: 0,
//           lectureNote: [],
//         });

//         const userId = req.user?._id as string;
//         // await redis.set(userId, JSON.stringify(user));
//         await user?.save();

//         course.purchased = (course.purchased || 0) + 1;
//         course.students.push(req.user);

//         // await redis.set(courseId, JSON.stringify(course), "EX", 604800);
//         await course.save();
//       }

//       // Render email template cho tất cả các khóa học
//       const html = await ejs.renderFile(
//         path.join(__dirname, "../mails/orderComfirm.ejs"),
//         { orders: mailOrders }
//       );

//       // Gửi email xác nhận
//       try {
//         if (user) {
//           await sendMail({
//             email: emailOrder,
//             subject: "Bạn có đơn hàng mới từ E-tutor",
//             template: "orderComfirm.ejs",
//             data: { orders: mailOrders },
//           });
//         }
//       } catch (error: any) {
//         return next(new ErrorHandler(error.message, 500));
//       }

//       await redis.set(req.user?._id as string, JSON.stringify(user));
//       await user.save();

//       if (typeof amount !== "number" || typeof user?.percent !== "number") {
//         throw new Error("amount hoặc user.percent không phải là số hợp lệ");
//       }
//       // Lưu thông tin đơn hàng
//       const order: any = {
//         courses,
//         user: user,
//         payment_info,
//         emailOrder,
//         amountTutor: Number(amount) * (Number(user?.percent) / 100),
//         amountAdmin:
//           Number(amount) - Number(amount) * (Number(user?.percent) / 100),
//       };

//       // Tạo thông báo cho từng tutor của mỗi khóa học
//       for (const course of courses) {
//         await NotificationModel.findOneAndUpdate(
//           { receiverId: course.tutor._id },
//           {
//             $push: {
//               notification: {
//                 creatorId: req.user?._id,
//                 title: "Thanh toán mới",
//                 message: `Bạn có một đơn hàng mới từ ${course.name}`,
//                 status: "Chưa đọc",
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString(),
//               },
//             },
//           },
//           { upsert: true, new: true }
//         );
//       }

//       newOrder(order, res, next);
//     } catch (error: any) {
//       next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
export const createOrder = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseIds, payment_info, emailOrder, amount } = req.body as {
        courseIds: string[];
        payment_info: any;
        emailOrder: string;
        amount: string;
      };
      const user = await UserModel.findById(req.user?._id);

      if (!user) {
        return next(new ErrorHandler("Không tìm thấy tài khoản", 404));
      }

      if (payment_info) {
        if ("id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
          );
          if (paymentIntent.status !== "succeeded") {
            return next(new ErrorHandler("Không tìm thấy authorized", 400));
          }
        }
      }

      const fullNameUser: any = user?.fullName
        ? user?.fullName
        : user?.lastName;

      for (const courseId of courseIds) {
        const course: any = await CourseModel.findById(courseId);
        if (!course) {
          return next(
            new ErrorHandler(`Không tìm thấy khóa học với ID ${courseId}`, 404)
          );
        }

        // Check if course already exists in user progress
        const courseExistInUser = user.progress.some((item: any) => {
          return item.courseId && item.courseId.toString() === courseId;
        });

        if (courseExistInUser) {
          return next(
            new ErrorHandler(`Bạn đã mua khóa học với ID ${courseId}`, 400)
          );
        }

        // Create order data for the specific course
        const mailOrder = {
          lastNameStudent: user?.lastName,
          nameStudent: fullNameUser,
          emailStudent: emailOrder,
          amount: amount,
          dataCourses: [
            {
              _id: course._id,
              name: course.name,
              thumbnail: course.thumbnail.url,
              nameTutor: course.tutor.fullName,
              price:
                course.estimatedPrice != 0
                  ? course.estimatedPrice
                  : course.price,
              date: new Date().toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          ],
          date: new Date().toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };

        const currentLecture = course.curriculumData[0].lectures[0]._id;

        // Update user progress
        user.progress.push({
          courseId: courseId,
          startCourse: false,
          endCourse: false,
          completedLectures: [],
          currentLecture: currentLecture.toString(),
          percentNumber: 0,
          lectureNote: [],
        });

        course.purchased = (course.purchased || 0) + 1;
        course.students.push(req.user);

        // Send email for the current course order
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/orderComfirm.ejs"),
          { orders: mailOrder }
        );

        try {
          if (user) {
            await sendMail({
              email: emailOrder,
              subject: "Bạn có đơn hàng mới từ E-tutor",
              template: "orderComfirm.ejs",
              data: { orders: mailOrder },
            });
          }
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }

        // Create and save order data
        const order: any = {
          courses: [course],
          user: user,
          tutor: course.tutor,
          payment_info,
          emailOrder,
          amountTutor: Number(amount) * (Number(course?.percent) / 100),
          amountAdmin:
            Number(amount) - Number(amount) * (Number(course?.percent) / 100),
        };

        // Create notification for each tutor
        await NotificationModel.findOneAndUpdate(
          { receiverId: course.tutor._id },
          {
            $push: {
              notification: {
                creatorId: req.user,
                title: "Thanh toán mới",
                message: `Bạn có một đơn hàng mới từ ${course.name}`,
                status: "Chưa đọc",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          },
          { upsert: true, new: true }
        );

        newOrder(order, res, next);
        const userId: any = req?.user?._id;
        await course.save();

        await user.save();
        await redis.set(userId, JSON.stringify(user), "EX", 6048000);
      }
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

// getAll Admin

export const getAllOrdersByAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = req.user?._id; // Assume _id is a string or ObjectId based on your schema
      let orders;

      if (req.user?.role === "admin") {
        orders = await OrderModel.find().populate("user");
      } else {
        orders = await OrderModel.find({
          tutor: new mongoose.Types.ObjectId(user),
        }).populate("user");
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const sendStripePublishableKey = CathAsynsError(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

export const newPayment = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount } = req.body;
      console.log(amount);

      // Validate the minimum amount (at least 1,000 VND)
      if (amount < 12000) {
        return next(new ErrorHandler("Amount must be at least ₫12,000.", 400));
      }

      const myPayment = await stripe.paymentIntents.create({
        amount: amount,
        currency: "USD",
        metadata: {
          company: "E-tutor",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(201).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// export const newPayment = CathAsynsError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { products } = req.body;

//       const listItems = products.map((item: any) => ({
//         price_data: {
//           currency: "VND",
//           product_data: {
//             name: item.name,
//             images: [item.thumbnail.url],
//           },
//           unit_amount: Math.round(item.estimatedPrice),
//         },
//         quantity: 1,
//       }));

//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: listItems,
//         mode: "payment",
//         success_url: "http://localhost:3000/course/67024ff88f3461745d400f2a",
//         cancel_url: "http://localhost:3000/course/67024ff88f3461745d400f2a",
//       });
//       res.json({ id: session.id });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

export const getOrderByUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const orders = await OrderModel.find({ user: userId });

      if (!orders || orders.length === 0) {
        return next(new ErrorHandler("Bạn chưa có đơn thanh toán nào", 404));
      }

      // Return the orders as a response
      res.status(200).json({
        success: true,
        orders: orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getOrder = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      const order = await OrderModel.findById(orderId).populate("user");

      // Return the orders as a response
      res.status(200).json({
        success: true,
        order: order,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const filterRevenueOrder = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = req?.user;
      const { period = "week", courseId } = req.query; // type: "week", "month", "quarter", "day"

      let groupByField;

      // Xác định trường nhóm dựa trên loại (type)
      if (period === "month") {
        groupByField = { $month: "$createdAt" };
      } else if (period === "quarter") {
        groupByField = { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } };
      } else if (period === "week") {
        groupByField = {
          $dateToString: { format: "%d/%m", date: "$createdAt" },
        };
      }

      const pipeline: any[] = [];

      if (user?.role === "tutor") {
        pipeline.push({
          $match: {
            courses: {
              $elemMatch: {
                tutor: new mongoose.Types.ObjectId(user._id), // Match courses where the tutor matches the logged-in user
              },
            },
          },
        });
      }
      if (courseId) {
        pipeline.push({
          $match: {
            courses: {
              $elemMatch: {
                _id: new mongoose.Types.ObjectId(courseId as string), // Match courses containing the specified courseId
              },
            },
          },
        });
      }

      if (period === "week") {
        const currentDate = new Date();
        const pastWeek = new Date();
        pastWeek.setDate(currentDate.getDate() - 6);

        pipeline.push({
          $match: {
            createdAt: {
              $gte: pastWeek,
              $lte: currentDate,
            },
          },
        });
      }

      pipeline.push(
        {
          $group: {
            _id: groupByField, // Group by the chosen field
            totalRevenue:
              user?.role !== "admin"
                ? { $sum: "$amountTutor" }
                : { $sum: "$amountAdmin" }, // Total tutor revenue only if role is 'tutor', otherwise set to 0
          },
        },
        {
          $sort: { _id: 1 }, // Sort by group
        }
      );

      const revenueData = await OrderModel.aggregate(pipeline);

      let allLabels: any;

      // Generate labels based on the period
      if (period === "month") {
        allLabels = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, 3, ..., 12]
      } else if (period === "quarter") {
        allLabels = [1, 2, 3, 4]; // Quarters 1, 2, 3, 4
      } else if (period === "week") {
        const currentDate = new Date();
        allLabels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - i);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${day}/${month}`;
        }).reverse(); // Reverse to show from oldest to newest
      }

      // Define month and day names for mapping
      const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ];

      const quarterNames = ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];

      // Map the result to match the labels and add missing data
      const mappedResults = allLabels.map((label: any) => {
        let entry = revenueData.find((e) => e._id === label);
        if (!entry) {
          entry = { totalRevenue: 0 }; // Set value to 0 if no data exists
        }

        let labelName = label;
        if (period === "month") {
          labelName = monthNames[label - 1];
        } else if (period === "quarter") {
          labelName = quarterNames[label - 1];
        } else if (period === "week") {
          // No conversion needed as the label is already in the format "dd/mm"
        }

        return {
          _id: labelName,
          totalRevenue: entry.totalRevenue,
        };
      });

      return res.status(200).json({
        period,
        revenueData: mappedResults,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const totalAmountByCategory = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await CategoryModel.find();

      // Dữ liệu doanh thu theo danh mục
      const revenueData = await Promise.all(
        categories.map(async (category) => {
          // Lấy tất cả các khóa học thuộc danh mục hiện tại
          const courses = await CourseModel.find({ category: category.title });

          // Lấy danh sách khóa học ID từ các khóa học
          const courseIds = courses.map((course) => course._id);

          // Tính tổng doanh thu `amountAdmin` từ các đơn hàng có các khóa học thuộc danh mục này
          const totalRevenue = await OrderModel.aggregate([
            {
              $match: {
                // Kiểm tra các đối tượng trong mảng `courses` có trường `category` và `_id` khớp với các khóa học trong danh mục
                courses: {
                  $elemMatch: {
                    _id: { $in: courseIds }, // Kiểm tra _id
                    category: category.title, // Kiểm tra category
                  },
                },
              },
            },
            {
              $group: {
                _id: null,
                totalAmountAdmin: { $sum: "$amountAdmin" },
              },
            },
          ]);

          return {
            category: category.title, // Tên danh mục
            totalRevenue: totalRevenue[0]?.totalAmountAdmin || 0, // Doanh thu (nếu không có, trả về 0)
          };
        })
      );

      // Trả về dữ liệu
      res.status(200).json({
        success: true,
        dataChart: revenueData,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const totalAmountDaily = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user?._id as string);
      const query =
        req.user && req.user.role !== "admin" ? { tutor: userId } : {};

      // Lấy 7 ngày gần nhất
      const currentDate = new Date();
      const pastWeek = new Date();
      pastWeek.setDate(currentDate.getDate() - 6);

      // Nhóm và tổng doanh thu theo ngày
      const salesData = await OrderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: pastWeek,
              $lte: currentDate,
            },
            ...query,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d/%m", date: "$createdAt" },
            },
            revenue: {
              $sum:
                req?.user?.role === "admin" ? "$amountAdmin" : "$amountTutor",
            }, // Tổng doanh thu từ `amountTutor`
          },
        },
      ]);

      // Tạo mảng ngày đầy đủ từ 7 ngày gần nhất
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(currentDate.getDate() - i);

        // Lấy ngày và tháng theo định dạng "ngày/tháng"
        const day = String(date.getDate()).padStart(2, "0"); // Định dạng ngày với 2 chữ số
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0, cần cộng thêm 1

        return `${day}/${month}`;
      }).reverse();

      // Chuyển salesData thành map để dễ tìm kiếm
      const salesMap = salesData.reduce((acc: any, item: any) => {
        acc[item._id] = item.revenue;
        return acc;
      }, {});

      // Xây dựng dữ liệu đầy đủ
      const dailySalesTrend = dates.map((date) => ({
        date,
        totalRevenue: salesMap[date] || 0, // Mặc định 0 nếu không có doanh thu
      }));

      // Trả về dữ liệu
      res.status(200).json({
        success: true,
        dataChart: dailySalesTrend,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const totalOrderByState = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user?._id as string);
      // Tạo điều kiện truy vấn dựa vào vai trò của người dùng
      const query =
        req.user && req.user.role !== "admin" ? { tutor: userId } : {};

      // Tổng số đơn hàng dựa theo điều kiện truy vấn
      const totalOrders = await OrderModel.countDocuments(query);

      // Tổng số đơn hàng trả tiền qua "Momo"
      const totalMomoOrders = await OrderModel.countDocuments({
        ...query,
        "payment_info.confirmation_method": "momo",
      });

      // Tổng số đơn hàng trả tiền qua thẻ
      const totalCardOrders = await OrderModel.countDocuments({
        ...query,
        "payment_info.confirmation_method": "automatic",
      });

      // Tính tổng doanh thu dựa vào vai trò của người dùng
      const totalRevenue = await OrderModel.aggregate([
        {
          $match: query, // Áp dụng điều kiện truy vấn
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum:
                req?.user?.role === "admin" ? "$amountAdmin" : "$amountTutor",
            },
          },
        },
      ]);

      // Lấy tổng doanh thu từ kết quả
      const totalRevenueAmount =
        totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;

      // Trả về kết quả
      res.status(200).json({
        success: true,
        totalOrders,
        totalMomoOrders,
        totalCardOrders,
        totalRevenue: totalRevenueAmount,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
