import "./App.css";
import Header from "./components/commons/Header";
import Footer from "./components/commons/Footer";
import { Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/main/Home";
import StoreView from "./pages/main/StoreView";
import StoreDetail from "./pages/main/StoreDetail";
import NotFound from "./pages/error/NotFound";
import Login from "./pages/login/login";

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
        <Route path="/Login" element={<Login />} />

        {/* 2. 헤더/푸터가 무조건 붙어야 하는 화면들 (BasicLayout 안에 넣기) */}
        <Route element={<BasicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/storeView" element={<StoreView />} />
          <Route path="/storeDetail" element={<StoreDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
