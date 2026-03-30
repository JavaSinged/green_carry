import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  // 탭 상태 관리 (개인 이용자 vs 사업자)
  const [activeTab, setActiveTab] = useState("personal");

  // 체크박스 및 입력 폼 상태 관리
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(true);

  // 로그인 버튼 클릭 시 실행
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", {
      tab: activeTab,
      admin: isAdmin,
      id: userId,
      pw: password,
      save: rememberId,
    });
    // TODO: axios 연동
  };

  return (
    <div className="screen-container">
      {/* 🌟 헤더 태그 없이 로고 텍스트만 단독으로 중앙 배치 🌟 */}
      <h1
        className="logo"
        style={{
          textAlign: "center",
          padding: "30px 0",
          margin: 0,
          fontSize: "2.2rem",
          fontWeight: 700,
        }}
      >
        GreenCarry
      </h1>

      {/* 메인 콘텐츠 구역 */}
      <div className="main-content">
        {/* 좌측 정보 섹션 */}
        <section className="info-section">
          <div className="eco-brand">
            <span className="eco-icon">E</span>
            <span className="eco-text">Eco-Delivery</span>
          </div>
          <h2 className="main-title">
            탄소 발자국을 줄이는
            <br />
            맛있는 한 끼
          </h2>
          <div className="stats">
            <div className="stat-item leaf">
              🌿 오늘 우리가 함께 아낀 탄소{" "}
              <span className="stat-value">1,245kg</span>
            </div>
            <div className="stat-item tree">
              🌳 식재된 나무 효과 <span className="stat-value">156그루</span>
            </div>
          </div>
        </section>

        {/* 중앙 로그인 폼 카드 */}
        <section className="login-card">
          <h3 className="card-title">반가워요, 에코 히어로!</h3>
          <p className="card-description">
            로그인하여 친환경 배달을 시작하세요
          </p>

          <div className="admin-login">
            <input
              type="checkbox"
              id="admin_check"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label htmlFor="admin_check">관리자 로그인</label>
          </div>

          {/* 탭 버튼 */}
          <div className="tabs">
            <button
              type="button"
              className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              개인 이용자
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "business" ? "active" : ""}`}
              onClick={() => setActiveTab("business")}
            >
              사업자
            </button>
          </div>

          {/* 로그인 폼 */}
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="remember-me">
              <input
                type="checkbox"
                id="remember_check"
                checked={rememberId}
                onChange={(e) => setRememberId(e.target.checked)}
              />
              <label htmlFor="remember_check">아이디 저장</label>
            </div>

            <button type="submit" className="login-button">
              로그인
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="card-footer">
            <a href="#signup">회원가입</a>
            <a href="#find">아이디/비밀번호 찾기</a>
          </div>
        </section>

        {/* 우측 일러스트 섹션 */}
        <section className="illustration-section">
          <div className="speech-bubble">
            <p>현재 456명이 환경을 지키고 있어요!</p>
          </div>
          <div className="character-illustration">
            <img src="/image/logo.png" alt="GreenCarry Logo" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
