import React, { useState } from "react";
import "./FindAccount.css";

const Account = () => {
  // 탭 상태 관리 (아이디 찾기 vs 비밀번호 재설정)
  const [activeTab, setActiveTab] = useState("findId");

  return (
    <div
      className="screen-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: 'url("/image/login/loginsign.jpg")', // 기존 로그인 배경과 동일한 경로
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#2e8b57",
        display: "flex",
        flexDirection: "column",
        color: "white",
        overflowY: "auto",
      }}
    >
      {/* 상단 로고 */}
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

      {/* 메인 콘텐츠 구역 (div로 유지하여 글로벌 CSS 충돌 방지) */}
      <div className="main-content find-content">
        {/* 좌측 정보 섹션 */}
        <section className="info-section">
          <div className="eco-brand">
            <span className="eco-icon">E</span>
            <span className="eco-text">Eco-Delivery</span>
          </div>
          <h2 className="main-title">
            계정을 잊으셨나요?
            <br />
            금방 찾아드릴게요
          </h2>
          <div className="stats notice-list">
            <div className="stat-item">
              <span className="notice-icon">🌱</span>
              다시 로그인하여 에코 히어로가 되어주세요.
            </div>
            <div className="stat-item">
              <span className="notice-icon shield">🛡️</span>
              본인 인증을 통해 안전하게 정보를 보호합니다.
            </div>
          </div>
        </section>

        {/* 중앙 계정 찾기 카드 */}
        <section className="find-card">
          {/* 탭 메뉴 */}
          <div className="find-tabs">
            <button
              type="button"
              className={`find-tab-btn ${activeTab === "findId" ? "active" : ""}`}
              onClick={() => setActiveTab("findId")}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className={`find-tab-btn ${activeTab === "resetPw" ? "active" : ""}`}
              onClick={() => setActiveTab("resetPw")}
            >
              비밀번호 재설정
            </button>
          </div>

          {/* 입력 폼 */}
          <form className="find-form">
            <input type="text" className="full-input" placeholder="이름" />

            {/* 이메일 & 인증번호 전송 버튼 (가로 배치) */}
            <div className="input-with-btn">
              <input type="email" className="flex-input" placeholder="이메일" />
              <button type="button" className="verify-send-btn">
                인증번호 전송
              </button>
            </div>

            <input
              type="text"
              className="full-input"
              placeholder="인증번호 입력"
            />

            <button type="submit" className="submit-verify-btn">
              인증 확인
            </button>
          </form>

          {/* 하단 링크 & 로고 */}
          <div className="find-footer">
            <a href="/login" className="back-to-login">
              ← 로그인 화면으로 돌아가기
            </a>
            <div className="footer-logo">GreenCarry</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Account;
