import React from "react";
import { useForm } from "react-hook-form";
import { AiOutlineUpload } from "react-icons/ai";
import useUser from "../../../hooks/useUser";

const SettingsOutlet = () => {
  const user = useUser();
  // Initialize form with default values from user data
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      title: user?.title || "",
      biography: user?.biography || "",
      website: user?.website || "",
      facebook: user?.socialProfiles?.facebook || "",
      instagram: user?.socialProfiles?.instagram || "",
      linkedin: user?.socialProfiles?.linkedin || "",
      twitter: user?.socialProfiles?.twitter || "",
      whatsapp: user?.socialProfiles?.whatsapp || "",
      youtube: user?.socialProfiles?.youtube || "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission logic here
  };

  return (
    <div className="relative max-w-7xl mx-auto py-6 px-4 lg:px-8">
      {/* Update Avatar */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray1 mb-8">
        <div className="flex gap-5">
          <div className="w-1/3 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">
              Cập nhật Ảnh đại diện
            </h2>
            <div className="flex flex-col items-center justify-center max-h-max border border-gray1 p-4">
            <div className="w-48 h-48 mb-4">
              <img
                src={user?.avatar?.url || images.AvatarCur}
                alt="Ảnh đại diện"
                className="w-full h-full object-cover"
              />
            </div>
              <>
                <label className="bg-gray-100 p-2 text-sm cursor-pointer">
                  Tải ảnh lên
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*" // Limit file types to images
                    // onChange={handlePhotoUpload}
                  />
                </label>
                <p className="text-xs text-center mt-2">
                  Ảnh phải dưới 1MB và tỉ lệ ảnh là 1:1
                </p>
              </>
          
          </div>
          </div>
          <div className="w-2/3 flex flex-col space-y-6">
            {/* Account Settings */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Cài đặt tài khoản</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Họ"
                      {...register("firstName")}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Tên"
                      {...register("lastName")}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    {...register("email")}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="+880 Số điện thoại của bạn..."
                    {...register("phoneNumber")}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Additional Information */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Thông tin khác</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block mb-1">Chức danh</label>
              <input
                type="text"
                placeholder="Chức danh, nghề nghiệp hoặc tiểu sử ngắn"
                {...register("title")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-1">Tiểu sử</label>
              <textarea
                placeholder="Mô tả về bản thân"
                {...register("biography")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>

      {/* Social Profile */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray1 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Hồ sơ mạng xã hội</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block mb-1">Website cá nhân</label>
            <input
              type="url"
              placeholder="URL website hoặc portfolio của bạn..."
              {...register("website")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Facebook</label>
              <input
                type="text"
                placeholder="Tên người dùng"
                {...register("facebook")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label class="block mb-1">Instagram</label>
              <input
                type="text"
                placeholder="Tên người dùng"
                {...register("instagram")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">LinkedIn</label>
              <input
                type="text"
                placeholder="Tên người dùng"
                {...register("linkedin")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block mb-1">Twitter</label>
              <input
                type="text"
                placeholder="Tên người dùng"
                {...register("twitter")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Whatsapp</label>
              <input
                type="tel"
                placeholder="Số điện thoại"
                {...register("whatsapp")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block mb-1">YouTube</label>
              <input
                type="text"
                placeholder="Tên người dùng"
                {...register("youtube")}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsOutlet;
