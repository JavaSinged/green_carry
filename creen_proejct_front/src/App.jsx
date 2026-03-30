import './App.css';
import Header from './components/commons/Header';
import Footer from './components/commons/Footer';
import { Route, Routes, Outlet } from 'react-router-dom';
import Home from './pages/main/Home';
import StoreView from './pages/main/StoreView';
import StoreDetail from './pages/main/StoreDetail';
import NotFound from './pages/error/NotFound';

import OrderPage from './pages/order/OrderPage';

import Login from './pages/login/login';
import Account from './pages/login/FindAccount';
import UserLayout from './components/layout/mypageSidebar/UserLayout';
import ManagerLayout from './components/layout/mypageSidebar/ManagerLayout';
import AdminLayout from './components/layout/mypageSidebar/AdminLayout';

const BasicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* 이 자리에 Home, StoreView 등이 쏙쏙 들어갑니다 */}
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <div>
      <Routes>
        {/* 1. 헤더/푸터가 필요 없는 단독 화면 */}
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />

        {/* 2. 헤더/푸터가 무조건 붙어야 하는 화면들 (BasicLayout 안에 넣기) */}
        <Route element={<BasicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/storeView" element={<StoreView />} />
          <Route path="/storeDetail" element={<StoreDetail />} />

          {/* 🧑 일반 유저 마이페이지 */}
          <Route path="/mypage/user" element={<UserLayout />}>
            {/* <Route index element={<UserProfile />} />{' '} */}
            {/* 기본 화면: 개인정보 수정 */}
            {/* <Route path="orders" element={<UserOrders />} />{' '} */}
            {/* /mypage/user/orders */}
            {/* 필요한 메뉴만큼 Route를 추가하세요 */}
          </Route>

          {/* 👨‍🍳 점주 마이페이지 */}
          <Route path="/mypage/manager" element={<ManagerLayout />}>
            {/* <Route index element={<ManagerDashboard />} />{' '} */}
            {/* 기본 화면: 통계 메인 */}
            {/* <Route path="menus" element={<ManagerMenus />} /> */}
          </Route>

          {/* 👮 관리자 마이페이지 */}
          <Route path="/mypage/admin" element={<AdminLayout />}>
            {/* <Route index element={<AdminMembers />} />{' '} */}
            {/* 기본 화면: 회원 관리 */}
            {/* <Route path="stores" element={<AdminStores />} /> */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
