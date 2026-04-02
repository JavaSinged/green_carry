import React, { useContext } from "react";
import styles from "./Header.module.css";
import Swal from "sweetalert2";

// Icons
import ParkIcon from "@mui/icons-material/Park";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { isLogin, user, logout, isLoading } = useContext(AuthContext);

  const backHost = import.meta.env.VITE_BACKSERVER;
  console.log("현재 헤더에 들어온 유저 정보:", user);

  // 🎨 GreenCarry 전용 Swal 스타일 함수
  const fireStyledSwal = (icon, title, text) => {
    return Swal.fire({
      icon: icon,
      title: title,
      text: text,
      customClass: {
        popup: "greencarry-swal-popup",
        title: "greencarry-swal-title",
        confirmButton: "greencarry-swal-confirm-button",
      },
      buttonsStyling: false,
      confirmButtonText: "확인",
      timer: 1500, // 1.5초 후 자동 닫힘
      showConfirmButton: false, // 버튼 없이 깔끔하게 문구만 노출
    });
  };

  // [수정] 클릭 시 즉시 안내 문구 노출 후 로그아웃
  const handleLogoutClick = () => {
    fireStyledSwal(
      "success",
      "로그아웃 완료",
      "안전하게 로그아웃 되었습니다. 메인으로 이동합니다.",
    ).then(() => {
      // 팝업이 닫히거나 시간이 다 되면 즉시 로그아웃 실행
      logout();
    });
  };

  // 마이페이지 클릭 함수
  const handleMyPageClick = () => {
    if (isLogin) {
      let targetPath = "/mypage/user";
      let roleText = "에코 히어로";
      const grade = Number(user?.memberGrade);

      if (grade === 0) {
        targetPath = "/mypage/admin";
        roleText = "관리자";
      } else if (grade === 2) {
        targetPath = "/mypage/manager";
        roleText = "파트너";
      }

      fireStyledSwal(
        "success",
        "이동 중",
        `${roleText}님의 공간으로 이동합니다.`,
      ).then(() => navigate(targetPath));
    } else {
      fireStyledSwal(
        "warning",
        "로그인 필요",
        "로그인 페이지로 이동합니다.",
      ).then(() => navigate("/login"));
    }
  };

  return (
    <header className={styles.header}>
      <div
        className={styles.logo_wrap}
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img src="/image/logo.png" alt="GreenCarry Logo" />
        <h5 className={styles.logo_text}>GreenCarry</h5>
      </div>

      <div className={styles.center_wrap}>
        <ParkIcon />
        <h5>
          지금까지 함께 심은 나무, 총 <span className={styles.badge}>41</span>{" "}
          그루
        </h5>
      </div>

      <div className={styles.button_wrap}>
        {isLoading ? null : (
          <>
            {isLogin && user && (
              <span className={styles.user_info}>
                <b>{user.memberName}</b>님 (
                {Number(user.memberGrade) === 0
                  ? "관리자"
                  : Number(user.memberGrade) === 1
                    ? "개인"
                    : "사업자"}
                )
              </span>
            )}

            <NotificationsNoneIcon style={{ cursor: "pointer" }} />

            <div
              onClick={handleMyPageClick}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* 로그인 상태이고 사진이 있으면 img, 없으면 기본 아이콘 노출 */}
              {isLogin && user?.memberThumb ? (
                <div className={styles.profile_circle}>
                  <img
                    src={`${backHost}${user.memberThumb}`}
                    alt="profile"
                    className={styles.profile_img}
                  />
                </div>
              ) : (
                <PersonIcon titleAccess="마이페이지" />
              )}
            </div>

            {/* 로그아웃 버튼: 클릭 시 바로 문구 -> 로그아웃 */}
            {isLogin ? (
              <div
                onClick={handleLogoutClick}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LogoutIcon titleAccess="로그아웃" />
              </div>
            ) : (
              <Link to="/login">
                <LoginIcon titleAccess="로그인" />
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
