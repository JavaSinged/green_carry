import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);

  // 🌟 새로고침 시 로컬스토리지 확인하여 상태 복구
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const name = localStorage.getItem("memberName");
    const grade = localStorage.getItem("memberGrade");

    if (token) {
      setIsLogin(true);
      setUser({ memberName: name, memberGrade: Number(grade) });
    }
  }, []);

  const logout = () => {
    localStorage.clear(); // 전체 삭제 혹은 특정 키만 삭제
    setIsLogin(false);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ isLogin, setIsLogin, user, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
