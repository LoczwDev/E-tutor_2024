import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import CoursesFilterPage from "./pages/coursesFilter/CoursesFilterPage";
import CoursesDetailPage from "./pages/coursesDetail/CoursesDetailPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SettingPage from "./pages/setting/SettingPage";
import CheckOutSingle from "./pages/checkOut/CheckOutSingle";
import CourseAccessPage from "./pages/coursesAccess/CourseAccessPage";
import CategoryOutlet from "./pages/admin/category/CategoryOutlet";
import Testvideo from "./components/Testvideo";
import CheckOutCart from "./pages/checkOut/CheckOutCart";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import CartPage from "./pages/cart/CartPage";
import OverviewOutlet from "./pages/admin/overview/OverviewOutlet";
import CoursesOutlet from "./pages/admin/courses/CoursesOutlet";
import UsersOutlet from "./pages/admin/users/UsersOutlet";
import SalesOutlet from "./pages/admin/sales/SalesOutlet";
import OrdersOutlet from "./pages/admin/orders/OrdersOutlet";
import SettingsOutlet from "./pages/admin/settings/SettingsOutlet";
import AdminLayout from "./components/layouts/AdminLayout";
import CourseEditOutlet from "./pages/admin/courseEdit/CourseEditOutlet";
import TeacherProfilePage from "./pages/teacherProfile/TeacherProfilePage";
import MessagePage from "./pages/message/MessagePage";
import BannerOutlet from "./pages/admin/banner/BannerOutlet";
import PostUserPage from "./pages/postsUser/PostUserPage";
import CreateUserPostPage from "./pages/postsUser/CreateUserPostPage";
import EditUserPostPage from "./pages/postsUser/EditUserPostPage";
import PostDetailPage from "./pages/posts/PostDetailPage";
import AllPostPage from "./pages/posts/AllPostPage";
import PostFavoriteUserPage from "./pages/postsUser/PostFavoriteUserPage";
import QuizOutlet from "./pages/admin/quiz/QuizOutlet";
import QuizStartQuestions from "./components/quiz/QuizStartQuestions";
import ViewCourseScreen from "./containers/adminPage/coursesMannager/ViewCourseScreen";
import EditQuiz from "./containers/adminPage/quizManager/EditQuiz";
import PostOutlet from "./pages/admin/post/PostOutlet";
import ViewPostScreen from "./containers/adminPage/postManager/ViewPostScreen";
import ReportOutlet from "./pages/admin/report/ReportOutlet";
import useUser from "./hooks/useUser";

export default function App() {
  const user = useUser();

  const isPublicPage = (path) => {
    const publicPages = [
      "/",
      "/teacher/:teacherId",
      "/user-cart",
      "/post/:postId",
      "/list-posts",
      "/list-courses",
      "/course/:courseId",
      "/checkout/:courseId",
      "/checkout/cart",
    ];

    // Kiểm tra nếu route hiện tại khớp với bất kỳ route công khai nào
    return publicPages.some((page) => path.startsWith(page.split(":")[0]));
  };

  const PrivateRoute = ({ children }) => {
    // Redirect if there is no user and the route is not public
    if (!user && !isPublicPage(window.location.pathname)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const RoleBasedRoute = ({ allowedRole, children }) => {
    // Redirect if the user's role does not match the allowed role
    if (!user || user?.role === allowedRole) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="App text-gray9">
      <Routes>
        <Route index path="/" element={<HomePage />} />
        <Route path="/teacher/:teacherId" element={<TeacherProfilePage />} />
        <Route path="/user-cart" element={<CartPage />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="/list-posts" element={<AllPostPage />} />
        <Route path="/list-courses" element={<CoursesFilterPage />} />
        <Route path="/course/:courseId" element={<CoursesDetailPage />} />
        <Route path="/checkout/:courseId" element={<CheckOutSingle />} />
        <Route path="/checkout/cart" element={<CheckOutCart />} />

        {/* <Route path="/user-createPost" element={<CreateUserPostPage />} />
        <Route path="/user-posts/edit/:postId" element={<EditUserPostPage />} />
        <Route path="/user-postFavorite" element={<PostFavoriteUserPage />} />
        <Route path="/message" element={<MessagePage />} />
        <Route path="/course-access/:courseId" element={<CourseAccessPage />} />
        <Route path="/test" element={<QuizStartQuestions />} />
        <Route path="/user-favorites" element={<FavoritesPage />} />
        <Route path="/user-posts" element={<PostUserPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/setting" element={<SettingPage />} /> */}
        <Route
          path="/user-createPost"
          element={
            <PrivateRoute>
              <CreateUserPostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-posts/edit/:postId"
          element={
            <PrivateRoute>
              <EditUserPostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-postFavorite"
          element={
            <PrivateRoute>
              <PostFavoriteUserPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/message"
          element={
            <PrivateRoute>
              <MessagePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/course-access/:courseId"
          element={
            <PrivateRoute>
              <CourseAccessPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/test"
          element={
            <PrivateRoute>
              <QuizStartQuestions />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-favorites"
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-posts"
          element={
            <PrivateRoute>
              <PostUserPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <PrivateRoute>
              <SettingPage />
            </PrivateRoute>
          }
        />
               <Route
          path="/messenger"
          element={
            <PrivateRoute>
              <MessagePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <RoleBasedRoute allowedRole="user">
                <AdminLayout />
              </RoleBasedRoute>
            </PrivateRoute>
          }
        >
          <Route index element={<OverviewOutlet />} />
          <Route path="manager-courses" element={<CoursesOutlet />} />
          <Route
            path="manager-courses/view/:courseId"
            element={<ViewCourseScreen />}
          />
          <Route
            path="manager-course/edit/:courseId"
            element={<CourseEditOutlet />}
          />
          <Route path="manager-quiz" element={<QuizOutlet />} />
          <Route path="manager-quiz/edit/:quizId" element={<EditQuiz />} />
          <Route path="manager-users" element={<UsersOutlet />} />
          <Route path="manager-category" element={<CategoryOutlet />} />
          <Route path="manager-banner" element={<BannerOutlet />} />
          <Route path="manager-sales" element={<SalesOutlet />} />
          <Route path="manager-posts" element={<PostOutlet />} />
          <Route
            path="manager-posts/view/:postId"
            element={<ViewPostScreen />}
          />
          <Route path="manager-orders" element={<OrdersOutlet />} />
          <Route path="manager-reports" element={<ReportOutlet />} />

          <Route path="manager-settings" element={<SettingsOutlet />} />
          <Route
            path="/admintest/manager-settings"
            element={<SettingsOutlet />}
          />
        </Route>
      </Routes>
    </div>
  );
}
