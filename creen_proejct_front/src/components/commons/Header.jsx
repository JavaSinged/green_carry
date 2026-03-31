import React, { useContext } from "react"; // 🌟 useContext 추가
import styles from "./Header.module.css";

// Icons
import ParkIcon from "@mui/icons-material/Park";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login"; // 🌟 로그인 아이콘 추가 추천

import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // 🌟 경로 확인 필수!

export default function Header() {
  const navigate = useNavigate();

  // 🌟 Context에서 상태와 로그아웃 함수 가져오기
  const { isLogin, user, logout } = useContext(AuthContext);

  return (
    <header className={styles.header}>
      {/* 1. 로고 영역 */}
      <div
        className={styles.logo_wrap}
        onClick={() => {
          navigate("/");
        }}
      >
        <img src="/image/logo.png" alt="GreenCarry Logo" />
        <h5 className={styles.logo_text}>GreenCarry</h5>
      </div>

      {/* 2. 중앙 나무 통계 영역 */}
      <div className={styles.center_wrap}>
        <ParkIcon />
        <h5>
          지금까지 함께 심은 나무, 총 <span className={styles.badge}>41</span>{" "}
          그루
        </h5>
      </div>

      {/* 3. 버튼 및 유저 상태 영역 */}
      <div className={styles.button_wrap}>
        {/* 로그인했을 때만 이름 표시 */}
        {isLogin && (
          <span className={styles.user_info}>
            <b>{user.memberName}</b>님 (
            {user.memberGrade === 0
              ? "관리자"
              : user.memberGrade === 1
                ? "개인"
                : "사업자"}
            )
          </span>
        )}

        <NotificationsNoneIcon />

        {/* 마이페이지 아이콘 */}
        <Link to={isLogin ? "/mypage" : "/login"}>
          <PersonIcon />
        </Link>

        {/* 🌟 로그인/로그아웃 토글 버튼 */}
        {isLogin ? (
          /* 로그인 상태 -> 로그아웃 실행 */
          <div
            onClick={logout}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <LogoutIcon titleAccess="로그아웃" />
          </div>
        ) : (
          /* 로그아웃 상태 -> 로그인 페이지로 이동 */
          <Link to="/login">
            <LoginIcon titleAccess="로그인" />
          </Link>
        )}
      </div>
    </header>
  );
}
