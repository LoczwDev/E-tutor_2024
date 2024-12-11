import { NextFunction, Request, Response } from "express";
import { CathAsynsError } from "../middleware/catchAsynsError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import ApplyModel from "../models/apply.model";
import userModel from "../models/user.model";

export const createApply = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dataApply } = req.body;

      const { website, facebook, tiktok, youtube, phone, aboutMe, branch, cv } =
        dataApply;
      if (!aboutMe) {
        return next(new ErrorHandler("Đừng để trống nội dung giới thiệu", 400));
      }
      if (!phone) {
        return next(new ErrorHandler("Đừng để trống số diện thoại", 400));
      }
      if (!branch) {
        return next(new ErrorHandler("Bạn phải chọn ngành nghề", 400));
      }
      if (!cv) {
        return next(new ErrorHandler("Bạn quên upload file rồi", 400));
      }

      let file = undefined;

      if (cv) {
        const thumbnailUpload = await cloudinary.v2.uploader.upload(cv, {
          folder: "fileApply",
        });

        file = {
          public_id: thumbnailUpload.public_id,
          url: thumbnailUpload.secure_url,
        };
      }

      // Tạo một document Apply mới và lưu vào database
      const newApplication = new ApplyModel({
        user: req.user,
        aboutMe,
        facebook,
        website,
        youtube,
        tiktok,
        phone,
        branch,
        file,
      });

      await newApplication.save();

      // Trả về phản hồi thành công
      res.status(201).json({ message: "Đăng ký giáo viên thành công!" });
    } catch (error: any) {
      // Xử lý lỗi
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllApply = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applications = await ApplyModel.find().populate("user");

      res.status(200).json({
        success: true,
        applys: applications,
      });
    } catch (error: any) {
      // Xử lý lỗi
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getApplyById = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applyId } = req.params;
      const application = await ApplyModel.findById(applyId).populate("user");

      res.status(200).json({
        success: true,
        apply: application,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateStatus = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applyId } = req.params;
      const { status } = req.body;

      // Find the application by ID
      const application: any = await ApplyModel.findById(applyId).populate(
        "user"
      );
      if (status === "Đã duyệt") {
        const user: any = await userModel.findById(application.user?._id);
        const fieldsToUpdate = [
          "aboutMe",
          "facebook",
          "website",
          "youtube",
          "tiktok",
          "phone",
          "branch",
        ];

        fieldsToUpdate.forEach((field) => {
          if (application[field]) {
            user[field] = application[field];
          }
        });

        user.role = "tutor";
        await user?.save();
      }

      if (!application) {
        return next(new ErrorHandler("Application not found.", 404));
      }

      application.status = status;
      await application.save();

      res.status(200).json({
        success: true,
        message: `Bạn đã '${status} đơn đăng ký'`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteApply = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applyId } = req.params;

      const application = await ApplyModel.findByIdAndDelete(applyId);

      if (!application) {
        return next(new ErrorHandler("Application not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Xóa thành công",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
