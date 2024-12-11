import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../../components/loader/Loading";
import ViewCommentPost from "./ViewCommentPost";
import ViewInfoPost from "./ViewInfoPost";
import { useGetViewPostAdmin } from "../../../hooks/usePosts";

const ViewPostScreen = () => {
  const { postId } = useParams();
  const { data, isLoading } = useGetViewPostAdmin(postId);
  const [activeTab, setActiveTab] = useState("info");

  if (isLoading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const dataTabs = [
    {
      link: "info",
      title: "Thông tin chi tiết",
    },
    {
      link: "comment",
      title: "Bình luận",
    },
  ];
  return (
    <div className="w-full p-5">
      <div className="w-full sticky top-[80px] bg-white z-[50]">
        {/* Tabs */}
        <div className="w-full flex items-center justify-start h-14 border-b border-gray1">
          {dataTabs.map((item, index) => (
            <div
              key={index}
              className={`w-1/4 font-medium text-base py-5 h-full text-center flex items-center justify-center cursor-pointer capitalize hover:text-primary/90 duration-300 ${
                activeTab === item.link
                  ? "border-b-2 border-primary text-primary"
                  : ""
              }`}
              onClick={() => setActiveTab(item.link)}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>
      {activeTab === "info" ? (
        <ViewInfoPost data={data} />
      ) : (
        <ViewCommentPost data={data?.post} />
      )}
    </div>
  );
};

export default ViewPostScreen;
