import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { getCommentByLecture } from "../../../services/commentService";
import CommentsContainer from "../../../components/comments/CommentsContainer";
import useUser from "../../../hooks/useUser";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

const ViewCommentCourse = ({ data }) => {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [dataLectureActive, setDataLectureActive] = useState(null);

  useEffect(() => {
    if (data) {
      const firstLecture = data?.curriculumData[0]?.lectures[0] || null;
      setDataLectureActive(firstLecture);
    }
  }, [data]);

  const {
    data: dataComment,
    isLoading: isLoadingComment,
    refetch: refectchComment,
  } = useQuery({
    queryFn: () => getCommentByLecture({ lectureId: dataLectureActive?._id }),
    queryKey: ["getCommentByLecture", dataLectureActive?._id],
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleLectureClick = (lecture) => {
    setDataLectureActive(lecture);
    refectchComment();
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <>
      {data?.status === "Nháp" ? (
        <div className="relative w-full min-h-[50vh] flex items-center justify-center text-error font-bold text-lg">
          Chưa xuất bản
        </div>
      ) : (
        <div className="relative w-full min-h-screen flex gap-5">
          {/* Left Section */}
          <div className="w-1/3 flex flex-col gap-5">
            {/* Video Section */}
            <div className="bg-white shadow-section rounded-b-lg p-5">
              <label className="block font-medium text-lg mb-3">
                Video bài học
              </label>
              <div className="w-full h-[300px]">
                <MediaPlayer
                  title={dataLectureActive?.title}
                  src={dataLectureActive?.video?.url}
                >
                  <MediaProvider />
                  <DefaultVideoLayout icons={defaultLayoutIcons} />
                </MediaPlayer>
              </div>
            </div>

            {/* Curriculum Section */}
            <div className="sticky top-0 bg-white shadow-section rounded-lg p-5">
              <label className="block font-medium text-lg mb-3">
                Chương trình học
              </label>
              <div className="w-full border">
                {data?.curriculumData?.map((item, index) => (
                  <div key={index} className="w-full border-b">
                    <div
                      className="w-full flex justify-between items-center cursor-pointer"
                      onClick={toggleDropdown}
                    >
                      <div
                        className={`w-full flex items-center justify-between py-4 px-3 ${
                          isOpen ? "bg-gray1 " : ""
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 duration-300 ${
                            isOpen ? "text-primary " : ""
                          }`}
                        >
                          <div>
                            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                          </div>
                          <div className="font-medium text-base line-clamp-1">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul
                      className={`w-full bg-transparent overflow-hidden duration-300 ease-in-out transition-all !pl-0 list-none ${
                        isOpen
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.lectures.map((lecture, index) => (
                        <LectureItem
                          key={index}
                          lecture={lecture}
                          index={index}
                          onClick={() => handleLectureClick(lecture)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="w-2/3 bg-white shadow-section rounded-b-lg p-5">
            <span className="text-lg font-medium mb-3 block">
              {dataComment?.comment?.length} bình luận
            </span>
            <CommentsContainer
              logginedUserId={user?._id}
              comments={dataComment?.comment}
              courseId={data?._id}
              lectureId={dataLectureActive?._id}
              refetch={refectchComment}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ViewCommentCourse;

const LectureItem = ({ lecture, index, onClick }) => {
  return (
    <button
      className="w-full flex items-center justify-between p-4 hover:bg-gray1"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 text-gray7 text-base">
        <div className="line-clamp-1 w-full">
          <span className="mr-1">{index + 1}.</span>
          {lecture.title}
        </div>
      </div>
    </button>
  );
};
