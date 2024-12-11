import axios from "axios";

export const createQuiz = async ({ quizTitle, questions }) => {
  try {
    const { data } = await axios.post("/api/quizs/", { quizTitle, questions });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const editQuiz = async ({ quizId, quizTitle, questions }) => {
  try {
    const { data } = await axios.put(`/api/quizs/${quizId}`, {
      quizTitle,
      questions,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getQuiz = async ({ quizId }) => {
  try {
    const { data } = await axios.get(`/api/quizs/${quizId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getAllQuiz = async () => {
  try {
    const { data } = await axios.get("/api/quizs/");
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getAllQuizByUser = async () => {
  try {
    const { data } = await axios.get("/api/quizs/getAllQuizByUser");
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getAllQuizByIds = async ({ quizIds }) => {
  try {
    console.log(quizIds);
    
    const { data } = await axios.get("/api/quizs/getAllQuizByIds", {
      params: {
        quizIds,
      },
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const deleteQuiz = async ({ quizId }) => {
  try {
    const { data } = await axios.delete(`/api/quizs/${quizId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const submitQuiz = async ({ quizId, answers }) => {
  try {
    const { data } = await axios.post("/api/quizs/submit", {
      quizId,
      answers,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
