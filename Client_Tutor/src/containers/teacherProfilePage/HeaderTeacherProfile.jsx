import React, { useState } from "react";
import images from "../../constants/images/images";
import { FaArrowRight, FaCirclePlay, FaStar } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import { useChatClient } from "../../hooks/useChatClient2";
import useUser from "../../hooks/useUser";
import { toast } from "sonner";

const HeaderTeacherProfile = ({ dataTeacher }) => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const navigate = useNavigate();
  


  // Destructure client and isLoading from useChatClient hook
  const { chatClient, isLoading: clientLoading } = useChatClient();

  // Hàm tạo cuộc trò chuyện mới
  const createNewChat = async () => {
    if (!user || !user._id) {
      toast.error("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }
  
    if (!dataTeacher || !dataTeacher.tutor._id) {
      toast.error("Dữ liệu giáo viên không hợp lệ.");
      return;
    }
  
    if (clientLoading) {
      console.log("Client is loading, please wait...");
      return;
    }
  
    if (!chatClient) {
      console.error("Stream client is not available.");
      return;
    }
  
    try {
      const channel = chatClient.channel("messaging", {
        members: [user._id, dataTeacher?.tutor._id],
      });
  
      await channel.create();
      navigate("/messenger", { state: { channelId: channel.id } });
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện: ", error);
      toast.error("Failed to create chat.");
    }
  };
  

  return (
    <>
      {isLoading && <Loader />}
      <div className="w-full p-5 bg-white border border-primary/20">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div>
              <div className="w-32 h-32 overflow-hidden rounded-full">
                <img
                  src={
                    dataTeacher?.tutor.avatar
                      ? dataTeacher?.tutor.avatar?.url
                      : images.AvatarCur
                  }
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-semibold">
                {dataTeacher?.tutor?.fullName}
              </span>
              <p className="text-sm text-gray5">
                {dataTeacher?.tutor?.title
                  ? dataTeacher?.tutor?.title
                  : "Học viên"}
              </p>
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-2 text-md">
                  <FaStar className="text-warning text-base mb-0.5" />
                  {dataTeacher?.total_ratings}
                  <span className="text-gray5 font-normal text-sm">
                    ({dataTeacher?.total_reviews} đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-md">
                  <FiUsers className="text-secondary text-lg" />
                  {dataTeacher?.total_students}
                  <span className="text-gray5 font-normal text-sm">
                    học viên
                  </span>
                </div>
                <div className="flex items-center gap-2 text-md">
                  <FaCirclePlay className="text-primary text-base" />
                  {dataTeacher?.total_courses}
                  <span className="text-gray5 font-normal text-sm">
                    khóa học
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={createNewChat}
            className="flex items-center justify-center gap-2 w-max bg-primary/10 capitalize text-primary hover:bg-primary/50 hover:text-white duration-300 py-2.5 px-4"
          >
            Nhắn tin ngay
            <FaArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};

export default HeaderTeacherProfile;
