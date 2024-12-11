import { useQuery } from "@tanstack/react-query";
import { getAllreport, getReport } from "../services/reportServer";

export const useGetAllReport = () => {
  return useQuery({
    queryFn: () => getAllreport(),
    queryKey: ["getAllreport"],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
export const useGetReport = (reportId) => {
  return useQuery({
    queryFn: () => getReport({ reportId }),
    queryKey: ["getReport", reportId],
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
