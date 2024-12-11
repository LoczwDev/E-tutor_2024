import { useQuery } from "@tanstack/react-query";
import { getAllApply, getApplyById } from "../services/applyService";

export const useGetAllApply = () => {
  return useQuery({
    queryFn: () => getAllApply(),
    queryKey: ["getAllQuiz"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
};
export const useGetApplyById = (applyId) => {
  return useQuery({
    queryFn: () => getApplyById({ applyId }),
    queryKey: ["getApplyById", applyId],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
};
