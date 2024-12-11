import React, { useEffect, useRef, useState } from "react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import parse from "html-react-parser";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { Element } from "react-scroll";
import getFileIcon from "../../../hooks/getFileIcon";
import TabsScrollDetail from "../../courseDetailPage/TabsScrollDetail";

const dataTabs = [
  { link: "Desc", title: "Mô tả" },
  { link: "Note", title: "Ghi chú" },
  { link: "File", title: "File đính kèm" },
  { link: "Comment", title: "Bình luận" },
];

const ViewMainCourse = ({
  dataLectureActive,
  stepLecture,
  isLoading,
  showSection,
}) => {
  const videoRef = useRef(null);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full">
          <div
            id="step-1"
            className="w-full h-[600px] overflow-hidden flex items-center justify-center bg-black"
          >
            <div className="w-[1050px] h-full overflow-hidden">
              <MediaPlayer
                ref={videoRef}
                title={dataLectureActive?.title}
                src={dataLectureActive?.video?.url}
                autoPlay
              >
                <MediaProvider className="h-full w-full" />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
              </MediaPlayer>
            </div>
          </div>
          <div
            className={`w-full flex flex-col items-start justify-between py-5 border-b ${showSection ? "px-10" : ""}`}
          >
            <div className="w-full flex items-start justify-between">
              <div className="text-2xl font-bold mb-5 w-[85%]">
                <span>{stepLecture}.</span>{" "}
                <span className="ml-1">{dataLectureActive?.title}</span>
              </div>
            </div>
          </div>
          <div className={`w-full ${showSection ? "px-10" : ""}`}>
            <div className="pb-5 top-0 sticky">
              <TabsScrollDetail dataTabs={dataTabs} />
            </div>
            <div className="pb-10">
              <Element name="Desc">
                <h3 className="text-2xl font-semibold mb-3">Mô tả bài giảng</h3>
                <div className="w-full text-justify">
                  {parse(dataLectureActive?.desc)}
                </div>
              </Element>
            </div>
            <div className="pb-10">
              <Element name="Note">
                <h3 className="text-2xl font-semibold mb-3">Ghi chú</h3>
                <div className="w-full text-justify">
                  {parse(dataLectureActive?.notes)}
                </div>
              </Element>
            </div>
            <div className="pb-10">
              <Element name="File">
                <h3 className="text-2xl font-semibold mb-3">
                  Đính kèm tập tin (
                  {dataLectureActive?.attachFiles
                    ? dataLectureActive?.attachFiles.length
                    : 0}
                  )
                </h3>
                <div className="w-full bg-gray0 py-4 px-5">
                  {dataLectureActive?.attachFiles &&
                  dataLectureActive?.attachFiles.length > 0 ? (
                    dataFile.map((file, index) => (
                      <div
                        key={index}
                        className="w-full flex items-center justify-between py-1"
                      >
                        <div className="mb-2 flex items-center gap-5">
                          <span className="text-4xl text-primary">
                            {getFileIcon(file.public_id)}
                          </span>
                          <div className="flex flex-col items-start">
                            <span className="text-base">
                              {file.original_filename
                                ? file.original_filename
                                : "File không tên"}
                            </span>
                            <p className="text-xs">Dug luong</p>
                          </div>
                        </div>
                        <button>
                          <a
                            href={file.url}
                            className={styled.buttonPrimary}
                            download
                          >
                            Tải xuống
                          </a>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Không có tập tin nào để tải xuống.
                    </p>
                  )}
                </div>
              </Element>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewMainCourse;
