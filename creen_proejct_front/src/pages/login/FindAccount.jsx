import React, { useState } from "react";
import "./FindAccount.css";
import { Link } from "react-router-dom";

const account = () => {
  // 1. 상태 관리
  const [activeTab, setActiveTab] = useState("findId"); // 탭 상태
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 전송 여부
  const [isVerified, setIsVerified] = useState(false); // ✨ 인증 완료 여부 (비밀번호 변경창 띄우기용)

  // 2. 탭을 변경할 때 실행되는 함수 (모든 상태를 초기화)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsCodeSent(false);
    setIsVerified(false); // 탭을 바꾸면 인증 상태도 초기화
  };

  // 3. 인증번호 확인 폼 제출 시 실행
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (activeTab === "findId") {
      alert("고객님의 아이디는 green*** 입니다."); // 아이디 찾기 완료 (예시)
    } else {
      // 비밀번호 재설정 탭에서 인증이 완료되면, 비밀번호 변경창으로 화면을 전환!
      setIsVerified(true);
    }
  };

  // 4. 새 비밀번호 변경 폼 제출 시 실행
  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    alert("비밀번호가 성공적으로 변경되었습니다. 로그인 화면으로 이동합니다.");
    window.location.href = "/login"; // 완료 후 로그인 화면으로 튕겨주기
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
        {/* ✨ 2. Link 태그로 글씨 감싸기 */}
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          GreenCarry
        </Link>
      </h1>

      <div className="main-content find-content">
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

        <section className="find-card">
          {/* 탭 메뉴 */}
          <div className="find-tabs">
            <button
              type="button"
              className={`find-tab-btn ${activeTab === "findId" ? "active" : ""}`}
              onClick={() => handleTabChange("findId")}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className={`find-tab-btn ${activeTab === "resetPw" ? "active" : ""}`}
              onClick={() => handleTabChange("resetPw")}
            >
              비밀번호 재설정
            </button>
          </div>

          {activeTab === "findId" ? (
            /* ==================== 아이디 찾기 폼 ==================== */
            <form className="find-form" onSubmit={handleVerifySubmit}>
              <input
                type="text"
                className="full-input"
                placeholder="이름"
                required
              />

              <div className="input-with-btn">
                <input
                  type="email"
                  className="flex-input"
                  placeholder="이메일"
                  required
                />
                <button
                  type="button"
                  className="verify-send-btn"
                  onClick={() => setIsCodeSent(true)}
                >
                  {isCodeSent ? "재전송" : "인증번호 전송"}
                </button>
              </div>

              {isCodeSent && (
                <>
                  <input
                    type="text"
                    className="full-input"
                    placeholder="인증번호 입력"
                    required
                  />
                  <button type="submit" className="submit-verify-btn">
                    아이디 찾기
                  </button>
                </>
              )}
            </form>
          ) : /* ==================== 비밀번호 재설정 폼 (인증 전/후 분기) ==================== */
          !isVerified ? (
            /* ✨ 1단계: 인증 진행 화면 ✨ */
            <form className="find-form" onSubmit={handleVerifySubmit}>
              <input
                type="text"
                className="full-input"
                placeholder="아이디"
                required
              />
              <input
                type="text"
                className="full-input"
                placeholder="이름"
                required
              />

              <div className="input-with-btn">
                <input
                  type="email"
                  className="flex-input"
                  placeholder="가입한 이메일"
                  required
                />
                <button
                  type="button"
                  className="verify-send-btn"
                  onClick={() => setIsCodeSent(true)}
                >
                  {isCodeSent ? "재전송" : "인증번호 전송"}
                </button>
              </div>

              {isCodeSent && (
                <>
                  <input
                    type="text"
                    className="full-input"
                    placeholder="인증번호 입력"
                    required
                  />
                  <button type="submit" className="submit-verify-btn">
                    인증 확인
                  </button>
                </>
              )}
            </form>
          ) : (
            /* ✨ 2단계: 인증 완료 후 새 비밀번호 설정 화면 ✨ */
            <form className="find-form" onSubmit={handlePasswordChangeSubmit}>
              <h3
                style={{
                  textAlign: "center",
                  color: "#333",
                  marginBottom: "10px",
                  marginTop: "0",
                }}
              >
                새 비밀번호 설정
              </h3>
              <p
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: "0.9rem",
                  marginTop: "0",
                  marginBottom: "20px",
                }}
              >
                새롭게 사용할 비밀번호를 입력해주세요.
              </p>

              {/* 비밀번호 입력은 글자가 안 보이게 type="password" 적용 */}
              <input
                type="password"
                className="full-input"
                placeholder="새 비밀번호 (8자 이상 영문/숫자 조합)"
                required
              />
              <input
                type="password"
                className="full-input"
                placeholder="새 비밀번호 확인"
                required
              />

              <button type="submit" className="submit-verify-btn">
                비밀번호 변경 완료
              </button>
            </form>
          )}

          <div className="find-footer">
            <a href="/login" className="back-to-login">
              ← 로그인 화면으로 돌아가기
            </a>
            <div className="footer-logo">GreenCarry</div>
          </div>
        </section>
        <section
          className="illustration-section"
          style={{ width: "320px", visibility: "hidden" }}
        >
          {/* 공간만 차지하게 투명(hidden) 처리했습니다. 
              만약 로그인 화면처럼 동물 그림을 똑같이 넣고 싶으시다면 
              visibility: "hidden"을 지우고 안에 img 태그를 넣으시면 됩니다! */}
        </section>
      </div>
    </div>
  );
};

export default account;
