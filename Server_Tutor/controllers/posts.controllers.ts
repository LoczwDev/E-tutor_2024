import { CathAsynsError } from "../middleware/catchAsynsError";
import { NextFunction, Request, Response } from "express";
import userModel from "../models/user.model";
import PostModel from "../models/post.model";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import CommentModel from "../models/comment.model";

export const createPost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req?.user?.listBlock?.postblock) {
        return next(new ErrorHandler("Bạn bị cấm tạo bài viết", 400));
      }
      const { title, content, topic, tags, status } = req.body;

      const user = await userModel.findById(req.user?._id);

      if (status === "Xuất bản") {
        if (!title || !content || !topic || !tags || tags.length === 0) {
          return next(
            new ErrorHandler(
              "Vui lòng điền đầy đủ các trường dữ liệu để xuất bản bài viết.",
              400
            )
          );
        }
      }

      let thumbnail = undefined;

      if (req.body.thumbnail) {
        const thumbnailUpload = await cloudinary.v2.uploader.upload(
          req.body.thumbnail,
          {
            folder: "thumbnailPost",
          }
        );

        thumbnail = {
          public_id: thumbnailUpload.public_id,
          url: thumbnailUpload.secure_url,
        };
      }

      const newPost = new PostModel({
        title,
        content,
        thumbnail,
        status: status || "Nháp",
        topic,
        user: user,
        tags,
      });

      await newPost.save();

      res.status(201).json({
        success: true,
        post: newPost,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const getPostsByUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allPosts = await PostModel.find({ user: req.user?._id });

      const drafts = allPosts.filter((post) => post.status === "Nháp");
      const published = allPosts.filter((post) => post.status === "Xuất bản");

      res.status(200).json({
        success: true,
        drafts,
        published,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getSignlePost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const post = await PostModel.findById(postId).populate("user");

      res.status(200).json({
        success: true,
        post,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
export const editPost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params; // Lấy ID bài viết từ tham số URL
      const { title, content, topic, tags, status, thumbnail } = req.body;

      // Tìm bài viết cần chỉnh sửa
      const post: any = await PostModel.findById(postId).populate("user");

      console.log(post.user?._id as string);

      if (!post) {
        return next(new ErrorHandler("Bài viết không tồn tại.", 404));
      }

      const userId = req.user?._id;

      // Kiểm tra quyền sửa bài viết
      if (post.user?._id.toString() !== userId) {
        return next(
          new ErrorHandler("Bạn không có quyền chỉnh sửa bài viết này.", 403)
        );
      }

      // Nếu muốn xuất bản, kiểm tra các trường dữ liệu
      if (status === "Xuất bản") {
        if (!title || !content || !topic || !tags || tags.length === 0) {
          return next(
            new ErrorHandler(
              "Vui lòng điền đầy đủ các trường dữ liệu để xuất bản bài viết.",
              400
            )
          );
        }
      }

      // Nếu có thumbnail mới, upload và cập nhật
      let updatedThumbnail = post.thumbnail;
      if (
        thumbnail &&
        typeof thumbnail === "string" &&
        !thumbnail.startsWith("https")
      ) {
        // Xóa thumbnail cũ trên Cloudinary (nếu có)
        if (post.thumbnail?.public_id) {
          await cloudinary.v2.uploader.destroy(post.thumbnail.public_id);
        }

        // Upload thumbnail mới lên Cloudinary
        const thumbnailUpload = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "thumbnailPost",
        });

        updatedThumbnail = {
          public_id: thumbnailUpload.public_id,
          url: thumbnailUpload.secure_url,
        };
      }

      // Cập nhật bài viết
      post.title = title || post.title;
      post.content = content || post.content;
      post.topic = topic || post.topic;
      post.tags = tags || post.tags;
      post.status = status || post.status;
      post.thumbnail = updatedThumbnail;

      await post.save();

      res.status(200).json({
        success: true,
        post,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const deletePost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;

      // Tìm bài viết trong cơ sở dữ liệu
      const post = await PostModel.findById(postId);

      const userId = req.user?._id;

      if (!post) {
        return next(new ErrorHandler("Bài viết không tồn tại", 404));
      }

      if (post.user.toString() !== userId && req.user?.role !== "admin") {
        return next(
          new ErrorHandler("Bạn không có quyền xóa bài viết này", 403)
        );
      }

      // Xóa bài viết
      await post.deleteOne({ postId });

      // Trả về phản hồi thành công
      res.status(200).json({
        success: true,
        message: "Bài viết đã được xóa thành công",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getAllPost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tag, page = 1, limit = 10 } = req.query;

      const query: any = { status: { $ne: "Nháp" } };

      if (tag && tag !== "" && tag !== "Khác") {
        query.tags = { $in: [tag] };
      }

      const skip = (Number(page) - 1) * Number(limit);
      const posts = await PostModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        .populate("user");

      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 500));
    }
  }
);
export const toggleFavoritePost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;

      const user: any = await userModel.findById(req.user?._id);
      const post: any = await PostModel.findById(postId).populate("user");

      const isFavorite = user.favoritePost.includes(postId);
      const userId: any = req.user?._id as string;
      if (isFavorite) {
        user.favoritePost = user.favoritePost.filter(
          (favorite: any) => favorite.toString() !== postId
        );
        post.favorite = post.favorite - 1;
        await post.save();

        await user.save();

        return res.status(200).json({ message: "Đã xóa yêu thích", user });
      } else {
        user.favoritePost.push(postId);
        post.favorite = post.favorite + 1;
        await post.save();

        await user.save();
        return res.status(200).json({ message: "Đã thêm yêu thích", user });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getPostFavoriteByUser = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userModel.findById(req.user?._id).populate({
        path: "favoritePost",
        populate: {
          path: "user",
          model: "User",
        },
      });

      return res.status(200).json({ success: true, posts: user?.favoritePost });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const updateStatusByPost = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;
      const { status } = req.body;

      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Bài viết không tồn tại." });
      }

      console.log(status);

      post.status = status;
      await post.save();

      return res
        .status(200)
        .json({ message: "Trạng thái bài viết đã được cập nhật.", post });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getViewPostAdmin = CathAsynsError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.params;

      if (!postId) {
        return next(new ErrorHandler("postId không được để trống", 400));
      }

      const totalComment = await CommentModel.countDocuments({ postId });

      const post: any = await PostModel.findById(postId).populate("user");
      const usersWhoLikedPost = await userModel.find({
        favoritePost: postId,
      });

      return res.status(200).json({
        success: true,
        usersWhoLikedPost,
        post,
        totalComment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
