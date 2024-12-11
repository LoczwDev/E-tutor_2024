import { NextFunction, Request, Response } from "express";
import { CathAsynsError } from "../middleware/catchAsynsError";
import userModel, { User } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
require("dotenv").config();
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendEmail";
import cloudinary from "cloudinary";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import {
  changeRoleUserService,
  getAllUsersService,
  getUserById,
} from "../services/user.service";
import CourseModel from "../models/courses.model";
import ApplyModel from "../models/apply.model";

interface registerBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      const isEmailExit = await userModel.findOne({ email });
      if (isEmailExit) {
        return next(new ErrorHandler("Email đã tồn tại", 400));
      }
      const user: registerBody = {
        firstName,
        lastName,
        email,
        password,
      };
      //  console.log(user);

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const mailRegister: any = {
        lastNameStudent: user?.lastName,
        date: new Date().toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        activationCode,
      };
      // const data = { user: { lastName: user.lastName }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activationMails.ejs"),
        { user: mailRegister }
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Xác nhận tài khoản E-tutor",
          template: "activationMails.ejs", // Use the absolute path here
          data: { user: mailRegister },
        });
        res.status(201).json({
          success: true,
          message: `Hãy chú ý email của bạn ${user.email}`,
          activationToken: activationToken.token,
          activationCode: activationCode,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: registerBody): ActivationToken => {
  console.log(user);

  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

interface ActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as ActivationRequest;
      const newUser: { user: User; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: User; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(
          new ErrorHandler(
            "Xác nhận mã OTP không đúng, bạn vui lòng kiểm tra email",
            400
          )
        );
      }
      const { firstName, lastName, email, password } = newUser.user;
      const exitsUser = await userModel.findOne({ email });
      if (exitsUser) {
        return next(new ErrorHandler("Email đã tồn tại", 400));
      }
      const user = await userModel.create({
        firstName,
        lastName,
        email,
        password,
      });
      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface LoginRequest {
  email: string;
  password: string;
}

export const loginUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Vui lòng điền đầy đủ thông tin", 400));
      }

      const user = await userModel
        .findOne({ email })
        .select("+password")
        .populate("favorites");
      if (!user) {
        return next(
          new ErrorHandler("Bạn đã nhập sai email hoặc mật khẩu", 400)
        );
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(
          new ErrorHandler("Bạn đã nhập sai email hoặc mật khẩu", 400)
        );
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      const userId = (req.user?._id as string) || "";
      // console.log(req.user);

      // Lỗi xà quần
      redis.del(userId);

      res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update access token

export const updateAccessToken = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;

      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      if (!decoded) {
        return next(new ErrorHandler("Không thể refresh token", 400));
      }

      const sesstion = await redis.get(decoded.id as string);
      if (!sesstion) {
        return next(new ErrorHandler("Không tìm thấy userId tại redis", 400));
      }

      const user = JSON.parse(sesstion);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "60m",
        }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );
      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      await redis.set(user?._id, JSON.stringify(user), "EX", 6048000);

      // res.status(200).json({
      //   status: true,
      //   accessToken,
      // });
      next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get Profile User

export const getProfileUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user = await userModel.findById(req.user?._id).populate("favorites");

      if (!user) {
        next(new ErrorHandler("Không tìm thấy thông tin tài khoản", 400));
      }

      res.status(201).json({
        success: true,
        user,
      });

      // await getUserById(userId, res);
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

// social Auth

interface SocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

export const socialAuth = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as SocialAuthBody;

      let user = await userModel.findOne({ email });
      if (!user) {
        // Create new user
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: "150",
        });

        user = await userModel.create({
          email,
          name,
          avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
        });
        sendToken(user, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update UserInfo

interface UpdateUserInfo {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  title?: string;
  introduction?: string;
  avatar?: string;
}

export const updateUserInfo = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, phone, title, introduction, avatar } =
        req.body as UpdateUserInfo;
      const userId = req.user?._id as string;
      const user = await userModel.findById(userId);

      if (firstName && user) user.firstName = firstName;
      if (lastName && user) user.lastName = lastName;
      if (phone && user) user.phone = phone;
      if (title && user) user.title = title;
      if (introduction && user) user.introduction = introduction;

      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: "150",
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: "150",
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update Userpassword

interface UpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}

export const updateUserPassword = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as UpdateUserPassword;
      const userId = req.user?._id as string;

      const user = await userModel.findById(userId).select("+password");
      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler("Bạn vui lòng không để trống dữ liệu", 400)
        );
      }
      if (!isPasswordMatch) {
        return next(
          new ErrorHandler(
            "Bạn đã cung cấp sai mật khẩu tài khoản, vui lòng nhập lại",
            400
          )
        );
      }
      if (user?.password === undefined) {
        return next(
          new ErrorHandler("Không tìm thấy thông tin tài khoản", 400)
        );
      }
      if (user && isPasswordMatch) {
        user.password = newPassword;
      }
      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update profile avatar

interface UpdateProfileAvatar {
  avatar: string;
}

export const updateProfileAvatar = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as UpdateProfileAvatar;
      const userId = req.user?._id as string;
      const user = await userModel.findById(userId);

      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: "150",
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: "150",
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// getAll amdin
export const getAllUsersByAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// update User role -- admin

export const changeRoleUserByAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.body;

      // Check if both id and role are provided
      if (!userId || !role) {
        return next(
          new ErrorHandler("Vui lòng cung cấp ID và vai trò mới.", 400)
        );
      }

      // Update the role of the user
      const user = await userModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      );

      if (!user) {
        return next(
          new ErrorHandler("Không tìm thấy người dùng để cập nhật.", 404)
        );
      }

      let result;
      if (role === "user") {
        const currentDate = new Date(); // Get the current date
        // Update courses where tutor is the given ID and status is either "Hoạt động", "Chờ duyệt", or "Ẩn"
        result = await CourseModel.updateMany(
          {
            tutor: userId,
            status: {
              $in: ["Hoạt động", "Chờ duyệt", "Ẩn", "Nháp", "Giáo viên củ"],
            },
          },
          {
            $set: {
              status: "Đã xóa",
              deletedAt: currentDate,
            },
          }
        );
      }

      res.status(200).json({
        success: true,
        message: `Vai trò của người dùng đã được cập nhật thành công. Số khóa học được cập nhật: ${
          result ? result.modifiedCount : 0
        }`,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete User by admin

export const deleteUserByAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);
      if (!user) {
        return next(new ErrorHandler("Không tìm thấy user", 500));
      }
      await user.deleteOne({ id });
      await redis.del(id);

      res.status(201).json({
        success: true,
        message: `Xóa tài khoản  của người dùng ${user?.lastName} thành công `,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Ghi chu

export const addLectureNote = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        courseId,
        lectureId,
        titleLecture,
        timeNoteLecture,
        textNote,
        styleNote,
        imgNote,
      } = req.body;
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: "Bạn cần phải đăng nhập" });
      }
      const courseProgress = user.progress.find((p) => p.courseId === courseId);

      if (!courseProgress) {
        return res.status(404).json({ message: "Không tìm thấy khóa học" });
      }
      const lectureNote = courseProgress.lectureNote.find(
        (ln) => ln.lectureId === lectureId
      );

      let imgNoteFile = null;

      if (imgNote) {
        try {
          const myCloud = await cloudinary.v2.uploader.upload(imgNote, {
            folder: "notes",
            width: 150,
          });
          imgNoteFile = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } catch (err) {
          return next(new ErrorHandler("Lỗi tải ảnh lên", 500));
        }
      }

      if (!lectureNote) {
        const newLectureNote: any = {
          lectureId,
          contentNote: [
            {
              titleLecture,
              timeNoteLecture,
              textNote: textNote ? textNote : "",
              styleNote: styleNote ? styleNote : "text",
              imgNote: imgNoteFile,
            },
          ],
        };
        courseProgress.lectureNote.push(newLectureNote);
      } else {
        const newContentNote: any = {
          titleLecture,
          timeNoteLecture,
          textNote: textNote ? textNote : "",
          styleNote: styleNote ? styleNote : "text",
          imgNote: imgNoteFile,
        };
        lectureNote.contentNote.push(newContentNote);
      }

      await user.save();

      const userId = req.user?._id as string;
      await redis.set(userId, JSON.stringify(user), "EX", 6048000);

      res.status(201).json({
        success: true,
        message: `Ghi chú bài giảng được thêm thành công `,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateLectureNote = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, lectureId, noteId, textNote } = req.body;

      // Tìm người dùng
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: "Bạn chưa đăng nhập" });
      }

      // Tìm khóa học trong tiến trình (progress) của người dùng
      const courseProgress = user.progress.find(
        (progress) => progress.courseId === courseId
      );
      if (!courseProgress) {
        return res.status(404).json({ message: "Bạn chưa mua khoá học này" });
      }

      // Tìm lecture note trong course
      const lectureNote = courseProgress.lectureNote.find(
        (note) => note.lectureId === lectureId
      );
      if (!lectureNote) {
        return res
          .status(404)
          .json({ message: "Chưa có ghi chú này trong khóa học" });
      }

      // Tìm content note trong lecture note và sửa
      const contentNote = lectureNote.contentNote.find(
        (note: any) => note._id.toString() === noteId
      );
      if (!contentNote) {
        return res
          .status(404)
          .json({ message: "Không tìm được conten ghi chú" });
      }
      contentNote.textNote = textNote;

      await user.save();

      const userId = req.user?._id as string;
      await redis.set(userId, JSON.stringify(user), "EX", 6048000);

      res.status(201).json({
        success: true,
        message: `Ghi chú đã được sữa thành công`,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteLectureNote = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, lectureId, noteId } = req.body;

      // Tìm người dùng
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: "Bạn chưa đăng nhập" });
      }

      const courseProgress = user.progress.find(
        (progress) => progress.courseId === courseId
      );
      if (!courseProgress) {
        return res.status(404).json({ message: "Bạn chưa mua khóa học này" });
      }

      // Tìm lecture note trong course
      const lectureNote = courseProgress.lectureNote.find(
        (note) => note.lectureId === lectureId
      );
      if (!lectureNote) {
        return res.status(404).json({ message: "Không tìm thấy bài giảng" });
      }

      // Tìm content note và xóa
      const contentNoteIndex = lectureNote.contentNote.findIndex(
        (note: any) => note._id.toString() === noteId
      );
      if (contentNoteIndex === -1) {
        return res.status(404).json({ message: "Không tìm thấy ghi chú" });
      }

      // Xóa content note
      lectureNote.contentNote.splice(contentNoteIndex, 1);
      await user.save();

      const userId = req.user?._id as string;
      await redis.set(userId, JSON.stringify(user), "EX", 6048000);

      res.status(201).json({
        success: true,
        message: `Xóa Ghi chú thành công`,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// export const getLectureNotes = CathAsynsError(

//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseId, lectureId } = req.body;

//       // Tìm người dùng
//       const user = await userModel.findById(req.user?._id);
//       if (!user) {
//         return res.status(404).json({ message: "Bạn chưa đăng nhập" });
//       }

//       const courseProgress = user.progress.find(
//         (progress) => progress.courseId === courseId
//       );
//       if (!courseProgress) {
//         return res.status(404).json({ message: "Bạn chưa mua khóa học này" });
//       }

//       // Nếu có lectureId, chỉ lấy ghi chú cho lecture đó
//       if (lectureId) {
//         const lectureNote = courseProgress.lectureNote.find(
//           (note:any) => note.lectureId === lectureId
//         ).sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by createdAt, newest first;
//         if (!lectureNote) {
//           return res.status(404).json({ message: "Không tìm thấy" });
//         }
//         return res
//           .status(200)
//           .json({ message: "Đã tìm được ghi chú", lectureNote });
//       }

//       // Nếu không có lectureId, trả về tất cả các ghi chú bài học trong khóa học
//       return res.status(200).json({
//         message: "Đã tìm được ghi chú",
//         lectureNotes: courseProgress.lectureNote,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// them yeu thich

export const getLectureNotes = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, lectureId } = req.body;

      // Tìm người dùng
      const user = await userModel.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({ message: "Bạn chưa đăng nhập" });
      }

      const courseProgress = user.progress.find(
        (progress) => progress.courseId === courseId
      );

      if (!courseProgress) {
        return res.status(404).json({ message: "Bạn chưa mua khóa học này" });
      }

      // Ensure lectureNote array exists or provide a default empty array
      const lectureNotes = courseProgress.lectureNote || [];

      // Nếu có lectureId, chỉ lấy ghi chú cho lecture đó
      if (lectureId) {
        const filteredNotes = lectureNotes
          .filter((note) => note.lectureId === lectureId)
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ); // Sort by createdAt, newest first

        if (!filteredNotes.length) {
          return res.status(404).json({ message: "Không tìm thấy" });
        }

        return res.status(200).json({
          message: "Đã tìm được ghi chú",
          lectureNote: filteredNotes,
        });
      }

      // Nếu không có lectureId, trả về tất cả các ghi chú bài học trong khóa học
      const sortedNotes = lectureNotes.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return res.status(200).json({
        message: "Đã tìm được ghi chú",
        lectureNotes: sortedNotes,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const toggleFavoriteCourse = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.body;

      const user = await userModel.findById(req.user?._id);

      if (!user) {
        return res.status(404).json({ message: "Bạn cần phải đăng nhập" });
      }

      const isFavorite = user.favorites.includes(courseId);
      const userId: any = req.user?._id as string;
      if (isFavorite) {
        user.favorites = user.favorites.filter(
          (favorite) => favorite.toString() !== courseId
        );

        await user.save();
        // await redis.set(userId, JSON.stringify(user), "EX", 6048000);

        return res
          .status(200)
          .json({ message: "Đã xóa yêu thích", favorites: user.favorites });
      } else {
        user.favorites.push(courseId);

        await user.save();
        // await redis.set(userId, JSON.stringify(user), "EX", 6048000);
        return res
          .status(200)
          .json({ message: "Đã thêm yêu thích", favorites: user.favorites });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get info Teacher

export const getTeacherInfo = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teacherId } = req.params;

      // Tìm thông tin giáo viên theo ID
      const teacher = await userModel.findById(teacherId);

      if (!teacher) {
        return res.status(404).json({ message: "Không tìm thấy giáo viên" });
      }

      const courses = await CourseModel.find({
        tutor: teacherId,
        status: "Hoạt động",
      }).populate({
        path: "reviews", // Trường cần populate
        populate: {
          path: "user", // Trường con cần populate trong mỗi revie
        },
      });

      const totalCourses = courses.length;
      const totalRatings = courses.reduce(
        (sum, course: any) => sum + course.ratings,
        0
      );
      const totalStudents = courses.reduce(
        (sum, course) => sum + (course.students?.length || 0),
        0
      );
      const totalReviews = courses.reduce(
        (sum, course) => sum + (course.reviews?.length || 0),
        0
      );

      return res.status(200).json({
        tutor: teacher,
        total_courses: totalCourses,
        total_ratings: totalRatings / totalCourses,
        total_reviews: totalReviews,
        total_students: totalStudents,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getProfileUserByAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      let user = await userModel.findById(userId).populate("favorites");

      if (!user) {
        next(new ErrorHandler("Không tìm thấy thông tin tài khoản", 400));
      }

      res.status(201).json({
        success: true,
        user,
      });

      // await getUserById(userId, res);
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateListBlock = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { updateData } = req.body;
      const { permissions, percentage } = updateData;

      const user: any = await userModel.findById(userId);
      if (!user.listBlock) {
        user.listBlock = {};
      }

      // Update the listBlock and percent
      user.listBlock = { ...user.listBlock, ...permissions };
      user.percent = percentage;

      // Save the updated user data
      await user.save();

      // Send the response after the save operation is completed
      res.status(200).json({
        message: "Cập nhật quyền thành công",
        success: true,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getTotalUserByType = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const totalApply = await ApplyModel.countDocuments();

      // Count total number of users
      const totalUser = await userModel.countDocuments();

      // Count number of users with the "tutor" role
      const totalTutor = await userModel.countDocuments({ role: "tutor" });

      // Count number of users with the "user" role (assuming "student" is represented as "user")
      const totalStudent = await userModel.countDocuments({ role: "user" });

      res.status(200).json({
        success: true,
        totalUser,
        totalTutor,
        totalStudent,
        totalApply,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getStuddentByTutor = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await CourseModel.find({ tutor: req.user?._id }).populate(
        "students"
      );

      // Collect unique student IDs
      const studentIds = new Set();
      courses.forEach((course) => {
        course.students.forEach((student: any) => {
          studentIds.add(student._id.toString());
        });
      });

      // Fetch user details for the collected student IDs
      const uniqueStudents = await userModel.find({
        _id: { $in: Array.from(studentIds) },
      });

      // Return the student details
      res.status(200).json({ students: uniqueStudents });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getAllTutor = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let tutors = await userModel
        .find({ role: "tutor" })
        .populate("favorites");

      if (!tutors) {
        return next(
          new ErrorHandler("Không tìm thấy thông tin tài khoản", 400)
        );
      }

      // Xử lý từng tutor để lấy thêm thông tin
      const tutorDetails = await Promise.all(
        tutors.map(async (tutor) => {
          // Lấy tất cả khóa học của tutor
          const courses = await CourseModel.find({ tutor: tutor._id }).populate(
            {
              path: "reviews",
              select: "user rating",
            }
          );

          // Tính toán dữ liệu chi tiết
          const totalCourses = courses.length;
          const totalRatings = courses.reduce(
            (sum, course: any) => sum + (course.ratings || 0),
            0
          );
          const totalStudents = courses.reduce(
            (sum, course) => sum + (course.students?.length || 0),
            0
          );
          const totalReviews = courses.reduce(
            (sum, course: any) => sum + (course.reviews?.length || 0),
            0
          );

          // Trả về thông tin chi tiết của tutor
          return {
            tutor: tutor,
            totalCourses,
            totalRatings,
            totalStudents,
            totalReviews,
          };
        })
      );

      // Trả về kết quả cuối cùng
      res.status(200).json({
        success: true,
        tutors: tutorDetails,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
