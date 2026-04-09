import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import styles from "./Header.module.css";
import Swal from "sweetalert2";
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";

// Icons
import ParkIcon from "@mui/icons-material/Park";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // 🌟 장바구니 아이콘 추가

import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useCartStore from "../../store/useCartStore"; // 🌟 장바구니 스토어 가져오기

export default function Header() {
  const navigate = useNavigate();
  const { isLogin, user, logout, isLoading } = useContext(AuthContext);
  const backHost = import.meta.env.VITE_BACKSERVER;

  // 🌟 [추가] 장바구니 개수 실시간 확인
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.length;

  const [communityPoint, setCommunityPoint] = useState(0);

  useEffect(() => {
    axios
      .get(`${backHost}/member/community-carbon`)
      .then((res) => {
        setCommunityPoint(Number(res.data));
      })
      .catch((err) => {
        console.error("커뮤니티 탄소량 로드 실패:", err);
      });
  }, [backHost]);

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
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleLogoutClick = () => {
    fireStyledSwal(
      "success",
      "로그아웃 완료",
      "안전하게 로그아웃 되었습니다. 메인으로 이동합니다.",
    ).then(() => {
      logout();
    });
  };

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
        <span>
          지금까지 우리 모두가 심은 나무, 총
          <strong>
            {" "}
            {Math.floor((communityPoint * 1000) / 6600).toLocaleString()}
          </strong>{" "}
          그루
        </span>
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

            {/* 🌟 장바구니 아이콘 추가 영역 */}
            <div
              className={styles.cart_icon_wrap}
              onClick={() => navigate("/orderPage")}
            >
              <ShoppingCartIcon />
              {cartCount > 0 && (
                <span className={styles.cart_badge}>{cartCount}</span>
              )}
            </div>

            <NotificationsNoneIcon style={{ cursor: "pointer" }} />

            <div
              onClick={handleMyPageClick}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isLogin ? (
                <div className={styles.profile_circle}>
                  {user?.memberThumb && user.memberThumb !== "null" ? (
                    <img
                      src={`${backHost}${user.memberThumb}`}
                      alt="profile"
                      className={styles.profile_img}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <AccountCircleSharpIcon
                      className={styles.icon_inside_header_image}
                    />
                  )}
                </div>
              ) : (
                <PersonIcon titleAccess="마이페이지" />
              )}
            </div>

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
