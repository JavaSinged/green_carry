import "./App.css";
import Header from "./components/commons/Header";
import Footer from "./components/commons/Footer";
import { Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/main/Home";
import StoreView from "./pages/main/StoreView";
import StoreDetail from "./pages/main/StoreDetail";
import NotFound from "./pages/error/NotFound";

import OrderPage from "./pages/order/OrderPage";

import Login from "./pages/login/login";
import Account from "./pages/login/FindAccount";
import UserLayout from "./components/layout/mypageSidebar/UserLayout";
import ManagerLayout from "./components/layout/mypageSidebar/ManagerLayout";
import AdminLayout from "./components/layout/mypageSidebar/AdminLayout";
import UserProfile from "./pages/mypage/user/UserProfile";
import UserInfoEdit from "./pages/mypage/user/UserInfoEdit";

import { AuthProvider } from "./context/AuthContext";
import UserSignup from "./pages/signup/UserSignup";
import ManagerSignup from "./pages/signup/ManagerSignup";
import Signup from "./pages/signup/Signup";

// 🌟 문지기 컴포넌트
import ProtectedRoute from "./context/ProtectedRoute";

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
          {/* 🔓 1. 퍼블릭 구역 (누구나 접근 가능) */}
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/userSignup" element={<UserSignup />} />
          <Route path="/managerSignup" element={<ManagerSignup />} />

          {/* 2. 헤더/푸터가 붙는 구역 */}
          <Route element={<BasicLayout />}>
            {/* 🔓 공통 접근 구역 */}
            <Route path="/" element={<Home />} />
            <Route path="/storeView" element={<StoreView />} />
            <Route path="/storeDetail" element={<StoreDetail />} />

            {/* ==================================================== */}
            {/* 🛡️ 일반 유저 (Grade: 1) 철통 방어 구역 */}
            {/* ==================================================== */}
            <Route element={<ProtectedRoute requireUser={true} />}>
              <Route path="/mypage/user" element={<UserLayout />}>
                <Route index element={<UserProfile />} />
                <Route path="userInfoEdit" element={<UserInfoEdit />} />
                {/* <Route path="orders" element={<UserOrders />} /> */}
              </Route>
            </Route>

            {/* ==================================================== */}
            {/* 🛡️ 사업자 파트너 (Grade: 2) 철통 방어 구역 */}
            {/* ==================================================== */}
            <Route element={<ProtectedRoute requireManager={true} />}>
              <Route path="/mypage/manager" element={<ManagerLayout />}>
                {/* 🚨 실제 존재하는 컴포넌트로 import 해서 교체하세요! */}
                <Route index element={<div>사업자 대시보드 화면</div>} />
                <Route
                  path="menus"
                  element={<div>사업자 메뉴 관리 화면</div>}
                />
              </Route>
            </Route>

            {/* ==================================================== */}
            {/* 🛡️ 총괄 관리자 (Grade: 0) 철통 방어 구역 */}
            {/* ==================================================== */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/mypage/admin" element={<AdminLayout />}>
                {/* 🚨 실제 존재하는 컴포넌트로 import 해서 교체하세요! */}
                <Route index element={<div>관리자 회원 관리 화면</div>} />
                <Route
                  path="stores"
                  element={<div>관리자 가게 승인 화면</div>}
                />
              </Route>
            </Route>

            {/* 🚫 위에서 안 걸린 이상한 주소는 전부 404 처리 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
