import React, { createContext, useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutTimerRef = useRef(null);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .greencarry-swal-popup {
        border-radius: 20px !important;
        padding: 2rem !important;
        font-family: 'Pretendard', sans-serif;
      }
      .greencarry-swal-title {
        color: var(--color-brand, #2e7d32) !important;
        font-size: 1.5rem !important;
        font-weight: 700 !important;
      }
      .swal2-icon.swal2-warning {
        border-color: var(--color-brand, #2e7d32) !important;
        color: var(--color-brand, #2e7d32) !important;
      }
      .swal2-icon.swal2-success {
        border-color: var(--color-brand, #2e7d32) !important;
      }
      .swal2-icon.swal2-success [class^='swal2-success-line'] {
        background-color: var(--color-brand, #2e7d32) !important;
      }
      .swal2-icon.swal2-success .swal2-success-ring {
        border: 4px solid var(--color-brand, #2e7d32) !important;
        opacity: 0.3;
      }
      .greencarry-swal-confirm-button {
        background-color: var(--color-brand, #2e7d32) !important;
        color: white !important;
        border-radius: 12px !important;
        padding: 12px 35px !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        margin-top: 1rem !important;
        cursor: pointer;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .greencarry-swal-confirm-button:hover {
        filter: brightness(0.9);
      }
    `;
    document.head.appendChild(style);
  }, []);

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
    });
  };

  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); //
    localStorage.removeItem("isAutoLogin"); //
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberName");
    localStorage.removeItem("memberGrade");
    localStorage.removeItem("memberThumb");
    setIsLogin(false);
    setUser(null);
  };

  // 🌟 로그아웃 함수
  const logout = (isExpired = false) => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (isExpired === true) {
      console.log("자동 로그아웃 실행됨!");
      fireStyledSwal(
        "warning",
        "세션 만료",
        "로그인 유지 시간이 만료되어 자동 로그아웃 되었습니다.",
      ).then(() => {
        clearAuthData();
        window.location.replace("/");
      });
    } else {
      isLoggingOut.current = true;
      clearAuthData();
      window.location.replace("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("memberName");
    const grade = localStorage.getItem("memberGrade");
    const id = localStorage.getItem("memberId");
    const thumb = localStorage.getItem("memberThumb");

    const isAutoLogin = localStorage.getItem("isAutoLogin") === "true";

    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          if (!isAutoLogin) {
            logout(true);
          } else {
            setIsLogin(true);
            setUser({
              memberId: id,
              memberName: name,
              memberGrade: Number(grade),
              memberThumb: thumb,
            });
          }
        } else {
          setIsLogin(true);
          setUser({
            memberId: id,
            memberName: name,
            memberGrade: Number(grade),
            memberThumb: thumb,
          });

          if (!isAutoLogin) {
            /*10초 테스트용*/
            //const remainingTimeInMs = 10000;
            const remainingTimeInMs = (decodedPayload.exp - currentTime) * 1000;

            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

            if (remainingTimeInMs > 0 && remainingTimeInMs < 2147483647) {
              logoutTimerRef.current = setTimeout(() => {
                if (!isLoggingOut.current) {
                  logout(true);
                }
              }, remainingTimeInMs);
            }
          } else {
            console.log(
              "자동 로그인 유저: 프론트 타이머를 비활성화하고 인터셉터 모드로 작동합니다.",
            );
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
          }
        }
      } catch (error) {
        console.error("토큰 검증 에러:", error);
        clearAuthData();
      }
    }

    setIsLoading(false);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLogin, setIsLogin, user, setUser, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
