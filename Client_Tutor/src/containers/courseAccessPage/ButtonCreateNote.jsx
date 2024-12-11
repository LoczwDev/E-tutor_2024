import React, { useRef, useState } from "react";
import styled from "../../constants/styles/styles";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { formatDurationModify } from "../../hooks/formatDuration";
import ContentNotePaint from "./ContentNotePaint";

const ButtonCreateNote = ({
  handleNoteLecture,
  durationVideoActive,
  textNote,
  setTextNote,
  dataLectureActive,
  courseId,
  refetch
}) => {
  const quillRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // State for active tab

  const showPopup = () => {
    setIsVisible(true);
  };

  const hidePopup = () => {
    setIsVisible(false);
  };

  const handleCreateNote = () => {
    handleNoteLecture();
    setIsVisible(false);
  };

  return (
    <>
      <button onClick={showPopup} className={`${styled.buttonPrimary}`}>
        Ghi chú
      </button>

      <div
        className={`fixed bottom-0 border-t border-[#ccc] shadow-section left-1/2 transform -translate-x-1/2 w-full h-max pt-10 pb-5 bg-white flex items-center justify-center transition-all duration-300 ease-in-out z-[200] ${
          isVisible ? "bottom-0" : "bottom-[-100%]"
        }`}
      >
        <div className="w-full flex flex-col items-center justify-center max-w-[1300px]">
          <div className="w-full">
            <h3 className="text-lg font-medium">
              Thêm ghi chú tại:{" "}
              <span className="ml-1 bg-primary p-3 text-white font-bold">
                {durationVideoActive ? formatDurationModify(durationVideoActive.toFixed(0)):0}
              </span>
            </h3>

            {/* Tabs */}
            <div className="flex mb-5 border-b">
              <button
                onClick={() => setActiveTab("text")}
                className={`px-4 py-2 ${
                  activeTab === "text"
                    ? "border-primary border-b-2 font-bold"
                    : ""
                }`}
              >
                Văn Bản
              </button>
              <button
                onClick={() => setActiveTab("draw")}
                className={`px-4 py-2 ${
                  activeTab === "draw"
                    ? "border-primary border-b-2 font-bold"
                    : ""
                }`}
              >
                Vẽ
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "text" && (
              <>
                <div className="w-full">
                  <div className="w-full">
                    <label className="block font-medium text-lg mb-1">
                      Nội dung
                    </label>
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={textNote}
                      onChange={setTextNote}
                      placeholder="Nhập mô tả khóa học của bạn"
                      className="w-full flex flex-col bg-transparent overflow-hidden text-gray6 border border-gray1"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["clean"],
                        ],
                      }}
                      formats={[
                        "header",
                        "bold",
                        "italic",
                        "underline",
                        "strike",
                        "list",
                        "bullet",
                        "link",
                        "image",
                      ]}
                    />
                  </div>
                </div>
                <div className="w-full flex items-center justify-end mt-5 gap-5">
                  <button
                    onClick={hidePopup}
                    className={`${styled.buttonGray}`}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleCreateNote}
                    className={`${styled.buttonPrimary}`}
                  >
                    Tạo Ghi chú
                  </button>
                </div>
              </>
            )}

            {activeTab === "draw" && (
              <div className="w-full">
                <div className="w-full">
                  {/* <label className="block font-medium text-lg mb-1">
                    Khu vực vẽ
                  </label> */}
                  <ContentNotePaint
                    hidePopup={hidePopup}
                    durationVideoActive={durationVideoActive}
                    dataLectureActive={dataLectureActive}
                    courseId={courseId}
                    refetch={refetch}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ButtonCreateNote;
