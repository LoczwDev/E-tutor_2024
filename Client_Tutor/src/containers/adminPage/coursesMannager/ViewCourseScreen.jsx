// components/ViewCourse.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetViewCourseAdmin } from "../../../hooks/useCourses";
import Loading from "../../../components/loader/Loading";
import ViewInfoCourse from "./ViewInfoCourse";
import {
  Clock,
  Eye,
  Flag,
  Languages,
  MessageCircle,
  Paperclip,
  Users,
  Video,
} from "lucide-react";
import { formatDurationModify } from "../../../hooks/formatDuration";
import ViewCommentCourse from "./ViewCommentCourse";

const ViewCourse = () => {
  const { courseId } = useParams();
  const { data, isLoading } = useGetViewCourseAdmin(courseId);
  const [activeTab, setActiveTab] = useState("info");

  const statsData = [
    {
      title: "Bài học",
      value: data?.totalLecture,
      icon: Video,
      color: "bg-red-500/10 text-red-500",
    },
    {
      title: "Bình luận",
      value: data?.totalComment,
      icon: MessageCircle,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Học sinh",
      value: data?.course?.students?.length,
      icon: Users,
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Trình độ",
      value: data?.course?.level,
      icon: Flag,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Ngôn ngữ",
      value: data?.course?.language,
      icon: Languages,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Phần trăm",
      value: `${data?.course?.percent}%`,
      icon: Paperclip,
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      title: "Thời gian",
      value: data ? formatDurationModify(data?.course?.durationCourse) : "N/A",
      icon: Clock,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Đã mua",
      value: data?.course?.purchased || 0,
      icon: Eye,
      color: "bg-teal-500/10 text-teal-500",
    },
  ];

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
        <ViewInfoCourse data={data} statsData={statsData} />
      ) : (
        <ViewCommentCourse data={data?.course} />
      )}
    </div>
  );
};

export default ViewCourse;
