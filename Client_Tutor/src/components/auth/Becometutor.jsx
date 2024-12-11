import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Select } from "antd";
import useUser from "../../hooks/useUser";
import images from "../../constants/images/images";
import { useMutation } from "@tanstack/react-query";
import { createApply } from "../../services/applyService";
import Loader from "../loader/Loader";
import { toast } from "sonner";

const Becometutor = () => {
  const user = useUser();
  const { register, handleSubmit, control } = useForm();

  const [cvBase64, setCvBase64] = useState(null);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ dataApply }) => {
      return createApply({
        dataApply,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Đã gửi đơn đăng ký thành công");
      const becometutorModal = document.getElementById("becometutor");
      becometutorModal.classList.remove("modal-open");
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    if (user) {
      const formData = {
        ...data,
        cv: cvBase64,
      };
      mutate({ dataApply: formData });
    } else {
      toast.error("Bạn cần phải đăng nhập nhé");
    }
  };

  return (
    <>
      {isPending && <Loader />}
      <div className="w-full h-full gap-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="bg-white p-8">
          <h2 className="text-3xl font-semibold text-center mb-6">
            Đăng ký giáo viên
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[70%,30%] gap-5">
              <div className="w-full">
                {/* Social Profiles */}
                <div className="flex flex-col mb-4">
                  <label
                    htmlFor="website"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Website cá nhân
                  </label>
                  <input
                    id="website"
                    type="url"
                    placeholder="Đường dẫn tới website cá nhân hoặc portfolio..."
                    className="border border-gray-300 rounded-md p-2 focus:outline-primary"
                    {...register("website")}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                  {[
                    {
                      label: "Facebook",
                      placeholder: "Đường dẫn",
                      id: "facebook",
                    },
                    { label: "TikTok", placeholder: "Đường dẫn", id: "tiktok" },
                    {
                      label: "YouTube",
                      placeholder: "Đường dẫn",
                      id: "youtube",
                    },
                    {
                      label: "Số điện thoại",
                      placeholder: "Số điện thoại",
                      id: "phone",
                    },
                  ].map(({ label, placeholder, id }) => (
                    <div key={id} className="flex flex-col">
                      <label
                        htmlFor={id}
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={id}
                        type={id === "phone" ? "tel" : "text"}
                        placeholder={placeholder}
                        className="border border-gray-300 rounded-md p-2 focus:outline-primary"
                        {...register(id)}
                      />
                    </div>
                  ))}
                </div>

                {/* About Me */}
                <div className="flex flex-col mb-4">
                  <label
                    htmlFor="aboutMe"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Giới thiệu bản thân
                  </label>
                  <textarea
                    id="aboutMe"
                    rows="4"
                    placeholder="Giới thiệu về bạn..."
                    className="border border-gray-300 rounded-md p-2 focus:outline-primary"
                    {...register("aboutMe")}
                  />
                </div>

                {/* CV Upload */}
                <div className="flex flex-col mb-4">
                  <label
                    htmlFor="cv"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Tải lên CV
                  </label>
                  <input
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="border border-gray-300 rounded-md p-2"
                    onChange={onFileChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Vui lòng tải lên tệp CV của bạn (.pdf, .doc, .docx) để chúng
                    tôi xem xét.
                  </p>
                </div>
              </div>
              <div className="w-full">
                <div className="flex flex-col items-center justify-center max-h-max border border-gray1 p-4 mb-4">
                  <div className="w-48 h-48 mb-4">
                    <img
                      src={user?.avatar ? user?.avatar?.url : images.AvatarCur}
                      alt="Ảnh đại diện"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-lg font-medium">{user?.fullName}</span>
                  <p className="text-xs text-gray5 line-clamp-1">
                    {user?.title}
                  </p>
                </div>

                {/* Select Branch */}
                <div className="flex flex-col">
                  <label
                    htmlFor="branch"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Ngành nghề
                  </label>
                  <Controller
                    name="branch"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="branch"
                        placeholder="Chọn ngành nghề..."
                        className="custom-select"
                        {...field}
                        options={[
                          {
                            label: "Công nghệ thông tin",
                            value: "Công nghệ thông tin",
                          },
                          { label: "Giáo dục", value: "Giáo dục" },
                          { label: "Y tế", value: "Y tế" },
                          { label: "Kinh doanh", value: "Kinh doanh" },
                          { label: "Kỹ thuật", value: "Kỹ thuật" },
                          { label: "Khác", value: "Khác" },
                        ]}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-5 text-center w-full flex items-center justify-center">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
              >
                Đăng ký
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Becometutor;
