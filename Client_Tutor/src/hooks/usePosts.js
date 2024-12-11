import { toast } from "sonner";
import {
  getAllPost,
  getPostFavoriteByUser,
  getPostsByUser,
  getSignlePost,
  getViewPostAdmin,
} from "../services/postsService";
import { useQuery } from "@tanstack/react-query";

export const useGetPostsByUser = () => {
  return useQuery({
    queryFn: () => getPostsByUser(),
    queryKey: ["postsByUser"],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetSignlePost = (postId) => {
  return useQuery({
    queryFn: () => getSignlePost({ postId }),
    queryKey: ["signlePost", postId],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetAllPost = (tag, countPage, limit) => {
  return useQuery({
    queryFn: () => getAllPost({ tag, countPage, limit }),
    queryKey: ["allPost"],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetPostFavoriteByUser = () => {
  return useQuery({
    queryFn: () => getPostFavoriteByUser(),
    queryKey: ["allPost"],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetViewPostAdmin = (postId) => {
  return useQuery({
    queryFn: () => getViewPostAdmin({ postId }),
    queryKey: ["allPost"],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
