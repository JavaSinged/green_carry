import React, { createContext, useState, useEffect } from "react";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 로그아웃 함수 (공용)
  const logout = (isExpired = false) => {
    localStorage.clear();
    setIsLogin(false);
    setUser(null);

    if (isExpired) {
      // ⏳ 시간이 다 돼서 로그아웃되는 경우
      Swal.fire({
        icon: "warning",
        title: "세션 만료",
        text: "로그인 유지 시간이 만료되어 자동 로그아웃 되었습니다.",
        confirmButtonColor: "#2e7d32",
      }).then(() => {
        window.location.replace("/"); // 🔄 새로고침하며 메인으로 이동
      });
    } else {
      // 사용자가 직접 버튼 눌러서 로그아웃하는 경우
      window.location.replace("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("memberName");
    const grade = localStorage.getItem("memberGrade");
    const id = localStorage.getItem("memberId");

    let logoutTimer; // ⏲️ 타이머를 저장할 변수

    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const currentTime = Math.floor(Date.now() / 1000);

        // 1️⃣ 이미 만료된 경우 (즉시 로그아웃)
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          logout(true);
        } else {
          // 2️⃣ 수명이 남아있는 경우 (정상 로그인 처리)
          setIsLogin(true);
          setUser({
            memberId: id,
            memberName: name,
            memberGrade: Number(grade),
          });

          // 🌟 [핵심] 3️⃣ 남은 수명을 계산해서 자동 로그아웃 예약하기
          //const remainingTime = 10000; 테스트용 10초 뒤 로그아웃
          const remainingTime = (decodedPayload.exp - currentTime) * 1000; // 밀리초 단위 변환
          console.log("토큰 유효시간 " + remainingTime);

          // 기존 타이머가 있다면 제거 (중복 방지)
          if (logoutTimer) clearTimeout(logoutTimer);

          // 남은 시간 뒤에 logout(true) 함수 실행 예약!
          logoutTimer = setTimeout(() => {
            console.log("⏳ 토큰 만료 시간이 되어 자동 로그아웃을 실행합니다.");
            logout(true);
          }, remainingTime);
        }
      } catch (error) {
        console.error("토큰 검증 에러:", error);
        localStorage.clear();
      }
    }

    setIsLoading(false);

    // 🧹 컴포넌트가 사라질 때 타이머 청소 (메모리 누수 방지)
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
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
