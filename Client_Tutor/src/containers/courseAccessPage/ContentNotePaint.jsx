import React, { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import { CiUndo } from "react-icons/ci";
import { IoCalendarClearOutline } from "react-icons/io5";
import { CiImageOn } from "react-icons/ci";
import styled from "../../constants/styles/styles";
import Loader from "../../components/loader/Loader";
import { toast } from "sonner";
import { useCreateNoteCouse } from "../../hooks/useUser";

const ContentNotePaint = ({
  hidePopup,
  courseId,
  dataLectureActive,
  durationVideoActive,
  refetch,
}) => {
  const firstCanvas = useRef(null);
  const [img, setImg] = useState(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const { mutate, isPending, isSuccess, isError } = useCreateNoteCouse();

  // Load image onto canvas from user's file
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const canvas = firstCanvas.current.canvasContainer.children[1]; // Access actual canvas
    const context = canvas.getContext("2d");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  };

  // Change brush color
  const handleColorChange = (e) => {
    setBrushColor(e.target.value);
    firstCanvas.current.setBrushColor(e.target.value); // Set the brush color for the canvas
  };

  // Change brush size
  const handleSizeChange = (e) => {
    setBrushSize(e.target.value);
    firstCanvas.current.setBrushRadius(e.target.value); // Set the brush size (radius) for the canvas
  };

  // const handleClick = () => {
  //   const canvas = firstCanvas.current.canvasContainer.children[1]; // Access actual canvas
  //   const base64Image = canvas.toDataURL(); // Get the canvas image data as base64
  //   setImg(base64Image); // Save base64 image and display it
  // };

  const clear = () => {
    firstCanvas.current.clear();
  };

  const undo = () => {
    firstCanvas.current.undo();
  };

  const handleNoteLecture = async () => {
    const canvas = firstCanvas.current.canvasContainer.children[1]; // Access actual canvas
    const base64Image = canvas.toDataURL();
    await mutate({
      courseId,
      lectureId: dataLectureActive._id,
      titleLecture: dataLectureActive.title,
      timeNoteLecture: durationVideoActive,
      styleNote: "img",
      imgNote: base64Image,
      textNote: "",
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Ghi chú thành công");
      refetch();
      hidePopup();
    }
  }, [isSuccess]);
  useEffect(() => {
    if (isError) {
      toast.error("Có lỗi trong quá trình xử lý, xin hãy thử lại sau");
    }
  }, [isError]);

  return (
    <div className="mx-auto">
      {isPending && <Loader />}
      <div>
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={clear}
            className="px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            <IoCalendarClearOutline />
          </button>
          <button
            onClick={undo}
            className="px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            <CiUndo />
          </button>
          <div>
            <label
              htmlFor="imgPaint"
              className="flex items-center gap-2 px-4 bg-primary text-white rounded hover:bg-yellow-600 transition cursor-pointer"
            >
              <CiImageOn />
              Tải ảnh
            </label>
            <input
              type="file"
              id="imgPaint"
              onChange={handleImageUpload}
              className="sr-only"
            />
          </div>
          <div>
            <input
              id="colorPicker"
              type="color"
              value={brushColor}
              onChange={handleColorChange}
              className="w-6 h-6"
            />
          </div>

          <div>
            <input
              id="sizePicker"
              type="range"
              value={brushSize}
              onChange={handleSizeChange}
              step="1"
              min="1"
              max="10"
              className="rounded-lg overflow-hidden appearance-none bg-gray1 h-3 w-128"
            />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <CanvasDraw
            brushRadius={brushSize}
            brushColor={brushColor}
            ref={firstCanvas}
            style={{
              borderRadius: "0.5rem",
              border: "1px solid #e2e8f0",
              width: "100%",
              maxWidth: "500px",
              height: "400px",
            }}
          />
        </div>
      </div>

      <div className="w-full flex items-center justify-end mt-5 gap-5">
        <button onClick={hidePopup} className={`${styled.buttonGray}`}>
          Hủy bỏ
        </button>
        <button
          onClick={handleNoteLecture}
          className={`${styled.buttonPrimary}`}
        >
          Tạo Ghi chú
        </button>
      </div>
    </div>
  );
};

export default ContentNotePaint;
