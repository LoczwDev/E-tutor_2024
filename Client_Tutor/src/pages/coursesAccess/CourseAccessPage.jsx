import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { LuDelete, LuMenu } from "react-icons/lu";
import { TbLockFilled } from "react-icons/tb";
import { MainLayout } from "../../components/layouts/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import useUser, {
  useCreateNoteCouse,
  useGetProfile,
} from "../../hooks/useUser";
import { FaRegClock, FaRegFolderOpen } from "react-icons/fa";
import { IoCheckmarkDone, IoPlayCircleOutline } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { formatDuration } from "../../hooks/formatDuration";
import styled from "../../constants/styles/styles";
import MainCourse from "../../containers/courseAccessPage/MainCourse";
import { usecontentCoursesByUser } from "../../hooks/useCourses";
import { useDispatch } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";
import Loader from "../../components/loader/Loader";
import TourGuide from "../../components/TourGuide";
import LectureItem from "../../containers/courseAccessPage/LectureItem";
import ModalContentRatting from "../../containers/courseAccessPage/ModalContentRatting";
import ContentNoteVideo from "../../containers/courseAccessPage/ContentNoteVideo";
import { toast } from "sonner";
import CourseSectionAccess from "../../containers/courseAccessPage/CourseSectionAccess";
import Loading from "../../components/loader/Loading";
import QuizStartQuestions from "../../components/quiz/QuizStartQuestions";
import QuizCourse from "../../components/quiz/QuizCourse";
const calculateTimeElapsed = (deletedAt) => {
  if (!deletedAt) return "N/A";
  const deletedDate = new Date(deletedAt);
  const deleteDate = new Date(deletedDate);
  deleteDate.setMonth(deleteDate.getMonth() + 12); // Thêm 12 tháng vào ngày xóa

  // Trả về ngày theo định dạng tiếng Việt (ngày tháng năm)
  return deleteDate.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const CourseAccessPage = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasMounted = useRef(false);

  const [user, setUser] = useState(null);
  const [checkQuiz, setCheckQuiz] = useState(false);

  const [curriculumData, setCurriculumData] = useState(null);
  const [dataLectureActive, setDataLectureActive] = useState(null);
  const [stepLecture, setStepLecture] = useState(1);

  const [dataCompleted, setDataCompleted] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  // Ghi chu
  const [durationVideoActive, setDurationVideoActive] = useState(0);
  const [textNote, setTextNote] = useState("");
  const [durationNote, setDurationNote] = useState(0);

  const handleRunVideoNote = (lectureId, timeNoteLecture) => {
    const lectureActive = data.content.curriculumData
      .map((item) => item.lectures)
      .flat()
      .find((lecture) => String(lecture._id) === String(lectureId));

    if (timeNoteLecture) {
      setDurationNote(Number(timeNoteLecture));
    }

    if (lectureActive) {
      // console.log("Lecture found:", lectureActive?.title);
      setDataLectureActive(lectureActive);
    } else {
      console.log("Khong tim thay!");
    }
  };

  const checkUser = useUser();
  useEffect(() => {
    if (!checkUser) {
      navigate("/");
    } else {
      const checkPurchased = checkUser.progress.some(
        (item) => item.courseId === courseId
      );
      if (!checkPurchased) {
        navigate("/");
      }
    }
  }, []);

  // Goi y
  const [startTour, setStartTour] = useState(false);

  const handleStartTour = () => {
    setStartTour(true);
    setShowSection(false);
  };

  const handleEndTour = () => {
    setStartTour(false);
  };

  const {
    mutate: mutateCreateNote,
    isPending: isPendingCreateNote,
    isSuccess: isSuccessCreateNote,
    isError: isErrorCreateNote,
    data: dataCreateNote,
  } = useCreateNoteCouse();

  const {
    data: dataUser,
    isLoading: isLoadingProfile,
    isError,
    refetch,
  } = useGetProfile();

  const {
    data,
    isLoading,
    refetch: refetchCourse,
    isFetching,
  } = usecontentCoursesByUser(courseId);

  useEffect(() => {
    if (dataUser && !isLoadingProfile && !isFetching) {
      // dispatch(userActions.setUserInfo(dataUser));
      setUser(dataUser?.user);
    }
  }, [dataUser, isFetching, isLoadingProfile]);

  useEffect(() => {
    if (data && !isLoading) {
      setCurriculumData(data?.content.curriculumData);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (!isLoadingProfile && user && dataUser) {
      if (Array.isArray(user.progress)) {
        const isPurchased = user.progress.some(
          (item) => item.courseId === courseId
        );

        if (!isPurchased) {
          navigate("/");
        }
      }
    }
  }, [user, dataUser, courseId, isLoadingProfile]);

  useEffect(() => {
    if (data && !isLoading && !hasMounted.current) {
      const firstLecture = data.content.curriculumData[0]?.lectures[0] || null;
      setDataLectureActive(firstLecture);
      hasMounted.current = true;
    }
  }, [data]);

  useEffect(() => {
    if (dataUser && user && !isLoadingProfile) {
      const dataLectureCourse = user?.progress.find(
        (item) => item.courseId === courseId
      );
      if (dataLectureCourse) {
        setCurrentLecture(dataLectureCourse.currentLecture);
        setDataCompleted(dataLectureCourse.completedLectures);
      }
    }
  }, [dataUser, courseId, isLoadingProfile, user]);

  const totalLectures =
    data?.content.curriculumData?.reduce((total, section) => {
      return total + section.lectures.length;
    }, 0) || 0;

  const courseProgress = user?.progress.find(
    (item) => item.courseId === courseId
  );
  const numberPercent = courseProgress ? courseProgress.percentNumber : 0;

  // ratting

  const handleRatting = () => {
    const modal = document.getElementById("rattingCourse");
    if (modal) {
      modal.classList.add("modal-open");
    }
  };

  const handleNoteLecture = async () => {
    await mutateCreateNote({
      courseId,
      lectureId: dataLectureActive._id,
      titleLecture: dataLectureActive.title,
      timeNoteLecture: durationVideoActive,
      textNote,
    });
    refetchCourse();
  };

  useEffect(() => {
    if (isSuccessCreateNote) {
      setTextNote("");
      setDurationVideoActive(0);
      refetch();
    }
  }, [isSuccessCreateNote]);

  const findLectureByStep = (step) => {
    // const currentLecture = dataLectureActive;

    let totalLecturesBefore = 0;

    for (let i = 0; i < data.content.curriculumData.length; i++) {
      const section = data.content.curriculumData[i];

      if (step > totalLecturesBefore + section.lectures.length) {
        totalLecturesBefore += section.lectures.length;
      } else {
        const lectureIndex = step - totalLecturesBefore - 1;
        const lecture = section.lectures[lectureIndex];

        const isCheckClock =
          currentLecture === lecture._id ||
          dataCompleted?.find((item) => item === lecture._id);

        if (!isCheckClock) {
          toast.error("Bạn chưa hoàn thành bài học hiện tại, quay lại nào!");
          return null;
        }

        return lecture;
      }
    }

    return null;
  };
  const [showSection, setShowSection] = useState();

  useEffect(() => {
    if (checkQuiz) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    // Cleanup function
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [checkQuiz]);

  return (
    <>
      {isLoadingProfile || isLoading ? (
        <div className="relative w-full flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : (
        <>
          {(isError || isPendingCreateNote) && <Loader />}
          {startTour && (
            <TourGuide
              start={startTour}
              setStartTour={setStartTour}
              onTourEnd={handleEndTour}
            />
          )}
          <ModalContentRatting
            courseId={courseId}
            user={user}
            dataCourse={data}
            refetchCourse={refetchCourse}
            refetch={refetch}
          />
          <div className="w-full relative py-2 px-10 bg-gray9 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate(-1)}
                className="cursor-pointer w-12 h-12 bg-primary rounded-full overflow-hidden flex items-center justify-center"
              >
                <FaArrowLeftLong />
              </div>
              <div className="flex items-start flex-col gap-1">
                <h3 className="text-white">{data?.content?.name}</h3>
                <div className="flex items-center justify-end gap-5">
                  <div className="flex items-center text-white text-sm gap-2">
                    <FaRegFolderOpen className="text-primary" />
                    {data?.content?.curriculumData.length} Bài học
                  </div>
                  <div className="flex items-center text-gray7 text-sm gap-2">
                    <IoPlayCircleOutline className="text-secondary" />
                    {totalLectures} Bài giảng
                  </div>
                  <div className="flex items-center text-gray7 text-sm gap-2">
                    <FaRegClock className="text-warning" />
                    {formatDuration(data?.content?.durationCourse)}
                  </div>
                  {data.content.deletedAt && (
                    <div className="flex items-center text-gray7 text-sm gap-2">
                      <LuDelete className="text-warning" />

                      <span className="text-error">
                        Khoá học sẽ bị xóa sau ngày:
                        <span className="ml-1">
                          {data.content.deletedAt
                            ? calculateTimeElapsed(data.content.deletedAt)
                            : "N/A"}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`${styled.buttonGray}`}
                onClick={handleStartTour}
              >
                Hướng dẫn
              </button>
              <button
                disabled={numberPercent !== 100}
                className={`flex items-center justify-center gap-3 bg-error/20 text-error hover:bg-primary/50 hover:text-white duration-300 py-2.5 px-4 !rounded-xl`}
                onClick={() => setCheckQuiz(!checkQuiz)}
              >
                Bài tập
                {numberPercent !== 100 && <TbLockFilled />}
              </button>
              <button
                onClick={handleRatting}
                className={`flex items-center justify-center gap-3 bg-warning/20 text-primary hover:bg-primary/50 hover:text-white duration-300 py-2.5 px-4 !rounded-xl`}
              >
                Đánh giá
              </button>
              <ContentNoteVideo
                user={user}
                courseId={courseId}
                lectureIdAcvite={dataLectureActive?._id}
                refetch={refetch}
                setDurationVideoActive={setDurationVideoActive}
                handleRunVideoNote={handleRunVideoNote}
                durationNote={durationNote}
              />
            </div>
          </div>
          <div
            className={`fixed bottom-0 right-0 left-0 w-full justify-end bg-black/50 shadow-lg transition-transform z-[500] ${
              checkQuiz
                ? "transform translate-y-0"
                : "transform translate-y-full"
            }`}
            style={{ transition: "transform 0.3s ease-in-out" }}
          >
            <div className="h-[90vh] bg-white">
              <button
                onClick={() => setCheckQuiz(!checkQuiz)}
                className="absolute top-0 right-0 w-max text-end z-[200]"
              >
                <span className="p-5 text-3xl block w-max hover:rotate-180 transform transition-all ease-in-out duration-500 text-primary hover:text-primary/50">
                  ✕
                </span>
              </button>
              <div className="w-full relative z-[50] overflow-y-auto overflow-x-hidden max-h-screen scrollbar-thin">
                <QuizCourse
                  quizs={data?.content?.quizsCourse}
                  checkQuiz={checkQuiz}
                  refetch={refetch}
                  user={user}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex items-start justify-center gap-5 my-5 px-2">
            <div
              className={`${showSection ? "w-full" : "w-3/5"} duration-300 transition-all ease-in-out`}
            >
              {!isLoading && dataLectureActive && !isLoadingProfile && (
                <MainCourse
                  user={user}
                  dataCourse={data}
                  textNote={textNote}
                  setTextNote={setTextNote}
                  durationVideoActive={durationVideoActive}
                  handleNoteLecture={handleNoteLecture}
                  dataStudents={data?.content?.students}
                  purchased={data?.content?.purchased}
                  setDurationVideoActive={setDurationVideoActive}
                  courseId={courseId}
                  dataLectureActive={dataLectureActive}
                  setDataLectureActive={setDataLectureActive}
                  stepLecture={stepLecture}
                  isLoading={isLoading}
                  refetch={refetch}
                  refetchCourse={refetchCourse}
                  dataCompleted={dataCompleted}
                  durationNote={durationNote}
                  showSection={showSection}
                />
              )}
            </div>
            <div
              className={`${showSection ? "max-w-0 hidden" : "max-w-2/5 block"} duration-300 transition-all ease-in-out `}
            >
              {/* Your content here */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-xl">Nội dung chương trình</h3>
                <span className="text-success font-semibold text-base">
                  {numberPercent.toFixed(0)}% hoàn thành
                </span>
              </div>
              <div className="w-full h-1 bg-gray1">
                <div
                  className={`h-full bg-success`}
                  style={{ width: `${numberPercent}%` }}
                />
              </div>
              {!isLoading && !isLoadingProfile && (
                <div
                  id="step-2"
                  className="w-full border border-gray1 my-5 sticky top-0"
                >
                  {curriculumData?.map((item, index) => {
                    const calculateStep = (sectionIndex, lectureIndex) => {
                      let totalLecturesBefore = 0;
                      for (let i = 0; i < sectionIndex; i++) {
                        totalLecturesBefore +=
                          curriculumData[i].lectures.length;
                      }
                      return totalLecturesBefore + lectureIndex + 1;
                    };

                    return (
                      <CourseSectionAccess
                        key={index}
                        user={user}
                        courseId={courseId}
                        stepLecture={stepLecture}
                        setStepLecture={setStepLecture}
                        dataLectureActive={dataLectureActive}
                        setDataLectureActive={setDataLectureActive}
                        durationCurriculum={item.durationCurriculum}
                        title={item.title}
                        lectures={item.lectures}
                        dataCompleted={dataCompleted}
                        currentLecture={currentLecture}
                        sectionIndex={index}
                        calculateStep={calculateStep}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 border-t border-[#ccc] shadow-section left-1/2 transform -translate-x-1/2 w-full h-max  bg-gray0 flex items-center justify-center transition-all duration-300 ease-in-out z-[100]">
            <div className="flex justify-between items-center gap-5 py-2">
              <button
                disabled={stepLecture <= 1}
                onClick={() => {
                  const prevLecture = stepLecture - 1;
                  const lectureActive = findLectureByStep(prevLecture); // Hàm để tìm bài giảng theo bước
                  if (lectureActive) {
                    setStepLecture(prevLecture); // Giảm stepLecture về bài trước
                    setDataLectureActive(lectureActive); // Cập nhật bài giảng hiện tại
                  }
                }}
                className={`${styled.buttonTran} disabled:!bg-gray1`}
              >
                Bài trước
              </button>

              <button
                disabled={stepLecture >= totalLectures} // Không cho phép đi tiếp nếu ở bài cuối cùng
                onClick={() => {
                  const nextLecture = stepLecture + 1;
                  const lectureActive = findLectureByStep(nextLecture);
                  if (lectureActive) {
                    setStepLecture(nextLecture);
                    setDataLectureActive(lectureActive);
                  }
                }}
                className={`${styled.buttonPrimary10} disabled:!bg-gray5`}
              >
                Bài tiếp theo
              </button>
            </div>
            <div className="absolute top-0 right-0 mx-4 bottom-0 w-1/3 flex items-center justify-end gap-3">
              <h3 className="text-base font-medium line-clamp-1">
                {stepLecture}.{dataLectureActive?.title}
              </h3>
              <button
                onClick={() => setShowSection(!showSection)}
                className="flex items-center justify-center gap-3 bg-gray9/10 text-gray9 hover:bg-primary/50 hover:text-white duration-300 py-2.5 px-4 !rounded-xl"
              >
                <LuMenu />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CourseAccessPage;
