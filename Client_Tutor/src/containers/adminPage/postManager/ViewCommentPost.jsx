import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { getCommentByPost } from "../../../services/commentService";
import CommentsContainer from "../../../components/comments/CommentsContainer";
import useUser from "../../../hooks/useUser";

const ViewCommentPost = ({ data }) => {
  const user = useUser();
  const {
    data: dataComment,
    isLoading: isLoadingComment,
    refetch: refectchComment,
  } = useQuery({
    queryFn: () => getCommentByPost({ postId: data?._id }),
    queryKey: ["getCommentByPost", data?._id],
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  return (
    <div className="relative w-full min-h-screen flex gap-5">
      {/* Left Section */}
      <div className="w-full bg-white shadow-section rounded-b-lg p-5">
        <span className="text-lg font-medium mb-3 block">
          {dataComment?.comment?.length} bình luận
        </span>
        <CommentsContainer
          logginedUserId={user?._id}
          comments={dataComment?.comment}
          postId={data?._id}
          refetch={refectchComment}
        />
      </div>

      {/* Right Section */}
    </div>
  );
};

export default ViewCommentPost;
