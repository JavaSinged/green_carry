import "./App.css";
import Header from "./components/commons/Header";
import Footer from "./components/commons/Footer";
import { Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/main/Home";
import StoreView from "./pages/main/StoreView";
import StoreDetail from "./pages/main/StoreDetail";
import NotFound from "./pages/error/NotFound";

import OrderPage from "./pages/order/OrderPage";
import PaymentPage from "./pages/order/PaymentPage";
import CheckoutPage from "./pages/order/CheckoutPage";

import Login from "./pages/login/Login";
import Account from "./pages/login/FindAccount";
import UserLayout from "./components/layout/mypageSidebar/UserLayout";
import ManagerLayout from "./components/layout/mypageSidebar/ManagerLayout";
import AdminLayout from "./components/layout/mypageSidebar/AdminLayout";
import UserProfile from "./pages/mypage/user/UserProfile";
import UserInfoEdit from "./pages/mypage/user/UserInfoEdit";
import UserDelAccount from "./pages/mypage/deleteMember/UserDelAccount";

import { AuthProvider } from "./context/AuthContext";
import UserSignup from "./pages/signup/UserSignup";
import ManagerSignup from "./pages/signup/ManagerSignup";
import Signup from "./pages/signup/Signup";
import UserCS from "./pages/mypage/user/UserCS";

import ManagerInfoEdit from "./pages/mypage/manager/ManagerInfoEdit";
import ManagerMenuList from "./pages/mypage/manager/ManagerMenuList";
import ManagerMenuEdit from "./pages/mypage/manager/ManagerMenuEdit";

import AdminDashboard from "./pages/mypage/admin/AdminDashboard";
import AdminUserManagement from "./pages/mypage/admin/AdminUserManagement";
import AdminStoreManagement from "./pages/mypage/admin/AdminStoreManagement";
import AdminReviewManagement from "./pages/mypage/admin/AdminReviewManagement";
import AdminContainerManagement from "./pages/mypage/admin/AdminContainerManagement";

// 🌟 문지기 컴포넌트
import ProtectedRoute from "./context/ProtectedRoute";
import ManagerDelAccount from "./pages/mypage/deleteMember/ManagerDelAccount";
import UserOrderList from "./pages/mypage/user/UserOrderList";
import ManagerDashboard from "./pages/mypage/manager/ManagerDashBoard";

const BasicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <Routes>
          {/* ==================================================== */}
          {/* 1. 퍼블릭 구역 (로그인한 사용자는 접근 불가) */}
          {/* ==================================================== */}
          <Route element={<ProtectedRoute requireGuest={true} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/userSignup" element={<UserSignup />} />
            <Route path="/managerSignup" element={<ManagerSignup />} />
          </Route>
          {/* ==================================================== */}
          {/* 2. 헤더/푸터가 붙는 구역 (BasicLayout) */}
          {/* ==================================================== */}
          <Route element={<BasicLayout />}>
            {/* 공통 접근 구역 (로그인 여부 상관없음) */}
            <Route path="/" element={<Home />} />
            <Route path="/storeView" element={<StoreView />} />
            <Route path="/storeDetail" element={<StoreDetail />} />
            {/* ---------------------------------------------------- */}
            {/* 일반 유저 (Grade: 1) 구역 */}
            {/* ---------------------------------------------------- */}
            <Route element={<ProtectedRoute requireUser={true} />}>
              {/* 마이페이지 사이드바가 필요 없는 일반 유저 전용 페이지 */}
              <Route path="/orderPage" element={<OrderPage />} />
              <Route path="/paymentPage" element={<PaymentPage />} />
              <Route path="/checkoutPage" element={<CheckoutPage />} />
              {/* 마이페이지 사이드바(UserLayout)가 적용되는 페이지 */}
              <Route path="/mypage/user" element={<UserLayout />}>
                <Route index element={<UserProfile />} />
                <Route path="profile" element={<UserInfoEdit />} />
                <Route path="userCS" element={<UserCS />} />
                <Route path="orderList" element={<UserOrderList />} />
                <Route path="deleteMember" element={<UserDelAccount />} />
              </Route>
            </Route>{" "}
            {/* ---------------------------------------------------- */}
            {/* 사업자 파트너 (Grade: 2) 구역 */}
            <Route element={<ProtectedRoute requireManager={true} />}>
              <Route path="/mypage/manager" element={<ManagerLayout />}>
                <Route index element={<ManagerDashboard />} />
                <Route path="profile" element={<ManagerInfoEdit />} />
                <Route path="menus" element={<ManagerMenuList />} />
                <Route path="menuEdit" element={<ManagerMenuEdit />} />
                <Route path="deleteMember" element={<ManagerDelAccount />} />
              </Route>
            </Route>
            {/* ---------------------------------------------------- */}
            {/* 총괄 관리자 (Grade: 0) 구역 */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/mypage/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="members" element={<AdminUserManagement />} />
                <Route path="stores" element={<AdminStoreManagement />} />
                <Route path="reviews" element={<AdminReviewManagement />} />
                <Route
                  path="containers"
                  element={<AdminContainerManagement />}
                />
              </Route>
            </Route>
            {/* ---------------------------------------------------- */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
