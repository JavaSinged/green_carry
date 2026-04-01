import React, { createContext, useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutTimerRef = useRef(null);
  // 🌟 수동 로그아웃 중인지 확인하는 깃발 (이중 방어)
  const isLoggingOut = useRef(false);

  // 🎨 [CSS 직접 주입] 별도 CSS 파일 없이 스타일 적용
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    /* 팝업 전체 창 */
    .greencarry-swal-popup {
      border-radius: 20px !important;
      padding: 2rem !important;
      font-family: 'Pretendard', sans-serif;
    }

    /* 제목 색상 */
    .greencarry-swal-title {
      color: var(--color-brand) !important;
      font-size: 1.5rem !important;
      font-weight: 700 !important;
    }

    /* [핵심] 느낌표(warning) 아이콘 색상 변경 */
    .swal2-icon.swal2-warning {
      border-color: var(--color-brand) !important; /* 동그란 테두리를 초록색으로 */
      color: var(--color-brand) !important;        /* 느낌표(!)를 초록색으로 */
    }

    /* [핵심] 체크(success) 아이콘 색상 변경 (필요 시) */
    .swal2-icon.swal2-success {
      border-color: var(--color-brand) !important;
    }
    .swal2-icon.swal2-success [class^='swal2-success-line'] {
      background-color: var(--color-brand) !important; /* 체크 표시 선을 초록색으로 */
    }
    .swal2-icon.swal2-success .swal2-success-ring {
      border: 4px solid rgba(46, 125, 50, 0.3) !important; /* 바깥 원 연하게 */
    }

    /* 확인 버튼 */
    .greencarry-swal-confirm-button {
      background-color: var(--color-brand) !important;
      color: white !important;
      border-radius: 12px !important;
      padding: 12px 35px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      margin-top: 1rem !important;
      cursor: pointer;
      border: none !important;
      outline: none !important;       /* 포커스 시 생기는 외곽선 제거 */
      box-shadow: none !important;    /* 그림자(보통 푸르스름한 선) 제거 */
    }
    .greencarry-swal-confirm-button:hover {
      background-color: #1b5e20 !important;
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

  // 🌟 로그아웃 함수
  const logout = (isExpired = false) => {
    // 1. 수동 로그아웃이라면 즉시 깃발을 올림
    if (!isExpired) {
      isLoggingOut.current = true;
    }

    // 2. 타이머 즉시 제거
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // 3. 만료로 인한 로그아웃일 때
    if (isExpired) {
      if (!isLoggingOut.current && localStorage.getItem("accessToken")) {
        // 🚨 [핵심 보안 패치] 팝업이 뜨기 직전, 가장 중요한 '토큰'만 즉시 파기합니다!
        // 이렇게 하면 화면(isLogin)은 유지되어 팝업이 예쁘게 뜨지만,
        // 사용자가 확인을 안 누르고 도망가도(새로고침) 다음 접속 시 무조건 비회원이 됩니다.
        localStorage.removeItem("accessToken");

        fireStyledSwal(
          "warning",
          "세션 만료",
          "로그인 유지 시간이 만료되어 자동 로그아웃 되었습니다.",
        ).then(() => {
          // 🌟 확인을 누르면 나머지 찌꺼기 정보도 모두 지우고 완벽하게 메인으로 이동
          localStorage.clear();
          setIsLogin(false);
          setUser(null);
          window.location.replace("/");
        });
      }
    } else {
      // 4. 수동 로그아웃일 때 (즉시 비우고 이동)
      localStorage.clear();
      setIsLogin(false);
      setUser(null);
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
          const remainingTimeInMs = 5000; //테스트용 시간 5초
          //const remainingTimeInMs = (decodedPayload.exp - currentTime) * 1000;

          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

          // 자바스크립트 setTimeout 한계(약 24.8일) 체크
          if (remainingTimeInMs > 0 && remainingTimeInMs < 2147483647) {
            logoutTimerRef.current = setTimeout(() => {
              // 실행 직전 수동 로그아웃 중인지 최종 확인
              if (!isLoggingOut.current) {
                logout(true);
              }
            }, remainingTimeInMs);
          }
        }
      } catch (error) {
        console.error("토큰 검증 에러:", error);
        localStorage.clear();
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
