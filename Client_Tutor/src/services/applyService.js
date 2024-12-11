import axios from "axios";

export const createApply = async ({ dataApply }) => {
  try {
    const { data } = await axios.post("/api/apply/", {
      dataApply,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
export const getAllApply = async () => {
  try {
    const { data } = await axios.get("/api/apply/");
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
export const getApplyById = async ({ applyId }) => {
  try {
    const { data } = await axios.get(`/api/apply/${applyId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
export const updateStatus = async ({ applyId, status }) => {
  try {
    const { data } = await axios.put(`/api/apply/${applyId}`, {
      status,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const deleteApply = async ({ applyId }) => {
  try {
    const { data } = await axios.delete(`/api/apply/${applyId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
