import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  createCourseNote,
  deleteCourseNote,
  getAllTutor,
  getAllUser,
  getProfileUser,
  getProfileUserByAdmin,
  getStuddentByTutor,
  getTeacherInfo,
  getTotalUserByType,
  toggleFavorite,
  updateCourseNode,
} from "../services/userService";
import { toast } from "sonner";

const useUser = () => {
  const userState = useSelector((state) => state.user);

  return userState?.userInfo?.user;
};

export default useUser;

export const useGetProfile = () => {
  return useQuery({
    queryFn: () => getProfileUser(),
    queryKey: ["profile"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
export const useGetAllUser = () => {
  return useQuery({
    queryFn: () => getAllUser(),
    queryKey: ["allUser"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateNoteCouse = () => {
  return useMutation({
    mutationFn: ({
      courseId,
      lectureId,
      titleLecture,
      timeNoteLecture,
      textNote,
      styleNote,
      imgNote,
    }) =>
      createCourseNote({
        courseId,
        lectureId,
        titleLecture,
        timeNoteLecture,
        textNote,
        styleNote,
        imgNote,
      }),
    onSuccess: (data) => {
      toast.success(data.message || "Tạo ghi chú thành công");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCourseNote = () => {
  return useMutation({
    mutationFn: ({ courseId, lectureId, noteId, textNote }) =>
      updateCourseNode({
        courseId,
        lectureId,
        noteId,
        textNote,
      }),
    onSuccess: (data) => {
      toast.success(data.message || "Sữa ghi chú thành công");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCourseNote = () => {
  return useMutation({
    mutationFn: ({ courseId, lectureId, noteId }) =>
      deleteCourseNote({
        courseId,
        lectureId,
        noteId,
      }),
    onSuccess: (data) => {
      toast.success(data.message || "Xóa ghi chú thành công");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useToggleFavorite = () => {
  return useMutation({
    mutationFn: ({ courseId }) =>
      toggleFavorite({
        courseId,
      }),
    onSuccess: (data) => {
      toast.success(data.message || "Thao tác thành công");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useGetTeacherInfo = (teacherId) => {
  return useQuery({
    queryFn: () => getTeacherInfo({ teacherId }),
    queryKey: ["teacher", teacherId],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useGetProfileUserByAdmin = (userId) => {
  return useQuery({
    queryFn: () => getProfileUserByAdmin({ userId }),
    queryKey: ["getProfileUserByAdmin", userId],
    onError: (error) => {
      toast.error(error.message);
    },
    // refetchOnWindowFocus: true,
    // refetchOnMount: false,
  });
};

export const useGetTotalUserByType = () => {
  return useQuery({
    queryFn: () => getTotalUserByType(),
    queryKey: ["getTotalUserByType"],
    onError: (error) => {
      toast.error(error.message);
    },
    // refetchOnWindowFocus: true,
    // refetchOnMount: false,
  });
};
export const useGetStuddentByTutor = () => {
  return useQuery({
    queryFn: () => getStuddentByTutor(),
    queryKey: ["getStuddentByTutor"],
    onError: (error) => {
      toast.error(error.message);
    },
    // refetchOnWindowFocus: true,
    // refetchOnMount: false,
  });
};

export const useGetAllTutor = () => {
  return useQuery({
    queryFn: () => getAllTutor(),
    queryKey: ["getAllTutor"],
    onError: (error) => {
      toast.error(error.message);
    },
    // refetchOnWindowFocus: true,
    // refetchOnMount: false,
  });
};

