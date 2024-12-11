import { useQuery } from "@tanstack/react-query";
import {
  getAllQuiz,
  getAllQuizByIds,
  getAllQuizByUser,
  getQuiz,
} from "../services/quizService";

export const useGetQuiz = (quizId) => {
  return useQuery({
    queryFn: () => getQuiz({ quizId }),
    queryKey: ["getQuiz", quizId],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useGetAllQuiz = () => {
  return useQuery({
    queryFn: () => getAllQuiz(),
    queryKey: ["getAllQuiz"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useGetAllQuizByUser = () => {
  return useQuery({
    queryFn: () => getAllQuizByUser(),
    queryKey: ["getAllQuizByUser"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetAllQuizByIds = (quizIds) => {
  return useQuery({
    queryFn: () => getAllQuizByIds({ quizIds }),
    queryKey: ["getAllQuizByIds", quizIds],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
