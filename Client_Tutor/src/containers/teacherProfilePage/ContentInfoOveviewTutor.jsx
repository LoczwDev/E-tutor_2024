import React from "react";

const ContentInfoOveviewTutor = ({ dataTeacher }) => {

  return (
    <div className="p-3 border border-gray1">
      <h3>Giới thiệu về tôi</h3>
      <p className="text-justify">
        {dataTeacher?.aboutMe
          ? dataTeacher?.aboutMe
          : "Giảng viên chưa cập nhât"}
      </p>
    </div>
  );
};

export default ContentInfoOveviewTutor;
