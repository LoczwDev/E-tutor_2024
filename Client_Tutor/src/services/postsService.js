import axios from "axios";

export const createPost = async ({
  title,
  content,
  topic,
  tags,
  status,
  thumbnail,
}) => {
  try {
    const { data } = await axios.post("/api/posts/createPost", {
      title,
      content,
      topic,
      tags,
      status,
      thumbnail,
    });

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getPostsByUser = async () => {
  try {
    const { data } = await axios.get("/api/posts/getPostsByUser");

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getSignlePost = async ({ postId }) => {
  try {
    const { data } = await axios.get(`/api/posts/getSignlePost/${postId}`);

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const editPost = async ({
  postId,
  title,
  content,
  topic,
  tags,
  status,
  thumbnail,
}) => {
  try {
    const { data } = await axios.put(`/api/posts/editPost/${postId}`, {
      title,
      content,
      topic,
      tags,
      status,
      thumbnail,
    });

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const deletePost = async ({ postId }) => {
  try {
    const { data } = await axios.delete(`/api/posts/deletePost/${postId}`);

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getAllPost = async ({ tag, countPage = 1, limit = 10 }) => {
  try {
    const { data } = await axios.get(`/api/posts/allPost`, {
      params: {
        tag,
        page: countPage,
        limit,
      },
    });

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const toggleFavoritePost = async ({ postId }) => {
  try {
    const { data } = await axios.put(`/api/posts/toggleFavoritePost/${postId}`);

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getPostFavoriteByUser = async () => {
  try {
    const { data } = await axios.get(`/api/posts/getPostFavoriteByUser`);

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const updateStatusByPost = async ({ postId, status }) => {
  try {
    const { data } = await axios.put(
      `/api/posts/updateStatusByPost/${postId}`,
      { status }
    );

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getViewPostAdmin = async ({ postId }) => {
  try {
    const { data } = await axios.get(`/api/posts/getViewPostAdmin/${postId}`);

    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};
