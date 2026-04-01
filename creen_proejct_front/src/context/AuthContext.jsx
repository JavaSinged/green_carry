import React, { createContext, useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutTimerRef = useRef(null);
  const isLoggingOut = useRef(false);

  // 🎨 [CSS 직접 주입] 아이콘 색상 및 버튼 테두리(outline) 완벽 제거
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

      /* ⚠️ 경고(Warning) 아이콘 색상 변경 */
      .swal2-icon.swal2-warning {
        border-color: var(--color-brand, #2e7d32) !important;
        color: var(--color-brand, #2e7d32) !important;
      }

      /* ✅ 성공(Success) 아이콘 색상 변경 */
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

      /* 🔘 확인 버튼 스타일 (경계선 완벽 제거) */
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
        outline: none !important;      /* 🚨 포커스 외곽선 제거 */
        box-shadow: none !important;   /* 🚨 그림자 선 제거 */
      }
      .greencarry-swal-confirm-button:hover {
        filter: brightness(0.9);
      }
      .greencarry-swal-confirm-button:focus,
      .greencarry-swal-confirm-button:active {
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // 🎨 스타일이 적용된 Swal 호출 함수
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

  // 🧹 [핵심 로직] 아이디 저장(savedUserId)을 살리기 위한 핀셋 삭제 함수
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberName");
    localStorage.removeItem("memberGrade");
    setIsLogin(false);
    setUser(null);
  };

  // 🌟 로그아웃 함수
  const logout = (isExpired = false) => {
    // 1. 타이머 무조건 정지
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // 2. 자동 로그아웃(세션 만료)일 때
    if (isExpired === true) {
      console.log("자동 로그아웃 실행됨!"); // 브라우저 콘솔(F12) 확인용

      // 💡 조건문 없이 바로 알림창 실행
      fireStyledSwal(
        "warning",
        "세션 만료",
        "로그인 유지 시간이 만료되어 자동 로그아웃 되었습니다.",
      ).then(() => {
        clearAuthData(); // 확인 누르면 그때 데이터 삭제
        window.location.replace("/");
      });
    }
    // 3. 수동 로그아웃일 때
    else {
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

    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          logout(true);
        } else {
          setIsLogin(true);
          setUser({
            memberId: id,
            memberName: name,
            memberGrade: Number(grade),
          });

          // 🌟 남은 시간 계산 (24일 초과 시 타이머 오버플로 방지)
          const remainingTimeInMs = 10000; //10초 테스트
          //const remainingTimeInMs = (decodedPayload.exp - currentTime) * 1000;

          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

          // 자바스크립트 setTimeout 한계(약 24.8일) 체크하여 안전할 때만 타이머 실행
          if (remainingTimeInMs > 0 && remainingTimeInMs < 2147483647) {
            logoutTimerRef.current = setTimeout(() => {
              if (!isLoggingOut.current) {
                logout(true);
              }
            }, remainingTimeInMs);
          }
        }
      } catch (error) {
        console.error("토큰 검증 에러:", error);
        // ❌ 에러 났을 때도 clear() 대신 핀셋 삭제 사용!
        localStorage.removeItem("accessToken");
        localStorage.removeItem("memberId");
        localStorage.removeItem("memberName");
        localStorage.removeItem("memberGrade");
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
