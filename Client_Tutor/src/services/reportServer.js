import axios from "axios";

export const createReport = async ({
  commentId,
  reason,
  postId,
  courseId,
  type,
}) => {
  try {
    const { data } = await axios.post("/api/report/", {
      commentId,
      reason,
      postId,
      courseId,
      type,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getAllreport = async () => {
  try {
    const { data } = await axios.get("/api/report/");
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getReport = async ({ reportId }) => {
  try {
    const { data } = await axios.get(`/api/report/${reportId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const deleteReport = async ({ reportId }) => {
  try {
    const { data } = await axios.delete(`/api/report/${reportId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
