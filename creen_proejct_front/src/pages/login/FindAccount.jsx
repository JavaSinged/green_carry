import React, { useState } from "react";
import "./FindAccount.css";
import { Link } from "react-router-dom";

const Account = () => {
  // 1. 상태 관리
  const [activeTab, setActiveTab] = useState("findId"); // 탭 상태 (findId / resetPw)
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 전송 여부
  const [isVerified, setIsVerified] = useState(false); // 인증 완료 여부 (비밀번호 변경창 전환용)

  // 2. 새 비밀번호 관련 상태 및 에러 메시지
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState(""); // 형식 검증 에러
  const [matchError, setMatchError] = useState(""); // 비밀번호 일치 에러

  // 탭 변경 시 모든 상태 초기화
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsCodeSent(false);
    setIsVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setMatchError("");
  };

  // 🌟 새 비밀번호 입력 시 형식 검증 (10자 이상, 영문+숫자 조합)
  const handlePwChange = (val) => {
    setNewPassword(val);
    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

    if (val && !pwRegex.test(val)) {
      setPwError("비밀번호는 영문자와 숫자를 포함하여 10자 이상이어야 합니다.");
    } else {
      setPwError("");
    }

    // 비밀번호 입력 중에 확인 칸과 불일치하면 메시지 갱신
    if (confirmPassword && val !== confirmPassword) {
      setMatchError("새 비밀번호를 다시 확인해 주세요.");
    } else {
      setMatchError("");
    }
  };

  // 🌟 새 비밀번호 확인 입력 시 일치 여부 검증
  const handleConfirmPwChange = (val) => {
    setConfirmPassword(val);
    if (newPassword !== val) {
      setMatchError("새 비밀번호를 다시 확인해 주세요.");
    } else {
      setMatchError("");
    }
  };

  // 아이디 찾기 또는 인증번호 확인 제출
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (activeTab === "findId") {
      alert("고객님의 아이디는 green*** 입니다.");
    } else {
      // 비밀번호 재설정 인증 완료 시 변경 화면으로 전환
      setIsVerified(true);
    }
  };

  // 비밀번호 변경 최종 제출
  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (pwError || matchError || !newPassword || !confirmPassword) {
      alert("비밀번호 형식을 확인해 주세요.");
      return;
    }
    alert("비밀번호가 성공적으로 변경되었습니다. 로그인 화면으로 이동합니다.");
    window.location.href = "/login";
  };

  return (
    <div className="screen-container">
      {/* 상단 로고 (메인 이동 링크) */}
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
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontFamily: "var(--font-logo)",
          }}
        >
          GreenCarry
        </Link>
      </h1>

      <div className="main-content find-content">
        {/* 좌측 정보 섹션 */}
        <section className="info-section" style={{ width: "320px" }}>
          <div className="eco-brand">
            <span className="eco-icon">E</span>
            <span
              className="eco-text"
              style={{ fontFamily: "var(--font-sub)" }}
            >
              Eco-Delivery
            </span>
          </div>
          <h2
            className="main-title"
            style={{ fontFamily: "var(--font-title)" }}
          >
            계정을 잊으셨나요?
            <br />
            금방 찾아드릴게요
          </h2>
          <div className="stats notice-list">
            <div className="stat-item">
              <span className="notice-icon">🌱</span>다시 로그인하여 에코
              히어로가 되어주세요.
            </div>
            <div className="stat-item">
              <span className="notice-icon shield">🛡️</span>본인 인증을 통해
              안전하게 정보를 보호합니다.
            </div>
          </div>
        </section>

        {/* 중앙 계정 찾기 카드 */}
        <section className="find-card" style={{ width: "450px" }}>
          {/* 탭 메뉴 */}
          <div className="find-tabs">
            <button
              type="button"
              className={`find-tab-btn ${activeTab === "findId" ? "active" : ""}`}
              onClick={() => handleTabChange("findId")}
              style={{ fontFamily: "var(--font-sub)" }}
            >
              아이디 찾기
            </button>
            <button
              type="button"
              className={`find-tab-btn ${activeTab === "resetPw" ? "active" : ""}`}
              onClick={() => handleTabChange("resetPw")}
              style={{ fontFamily: "var(--font-sub)" }}
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
                  <button
                    type="submit"
                    className="submit-verify-btn"
                    style={{ fontFamily: "var(--font-title)" }}
                  >
                    아이디 찾기
                  </button>
                </>
              )}
            </form>
          ) : !isVerified ? (
            /* ==================== 비밀번호 재설정 1단계: 인증 ==================== */
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
                  <button
                    type="submit"
                    className="submit-verify-btn"
                    style={{ fontFamily: "var(--font-title)" }}
                  >
                    인증 확인
                  </button>
                </>
              )}
            </form>
          ) : (
            /* ==================== 비밀번호 재설정 2단계: 변경 (검증 로직) ==================== */
            <form className="find-form" onSubmit={handlePasswordChangeSubmit}>
              <h3
                style={{
                  textAlign: "center",
                  color: "#333",
                  marginBottom: "5px",
                  marginTop: "0",
                  fontFamily: "var(--font-sub)",
                }}
              >
                새 비밀번호 설정
              </h3>
              <p
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: "0.85rem",
                  marginTop: "0",
                  marginBottom: "20px",
                }}
              >
                새롭게 사용할 비밀번호를 입력해주세요.
              </p>

              <div style={{ marginBottom: "15px" }}>
                <input
                  type="password"
                  className="full-input"
                  placeholder="새 비밀번호 (10자 이상 영문/숫자)"
                  value={newPassword}
                  onChange={(e) => handlePwChange(e.target.value)}
                  required
                />
                {pwError && (
                  <div
                    style={{
                      color: "#e53935",
                      fontSize: "0.75rem",
                      marginTop: "5px",
                      paddingLeft: "5px",
                    }}
                  >
                    {pwError}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <input
                  type="password"
                  className="full-input"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPwChange(e.target.value)}
                  required
                />
                {matchError && (
                  <div
                    style={{
                      color: "#e53935",
                      fontSize: "0.75rem",
                      marginTop: "5px",
                      paddingLeft: "5px",
                    }}
                  >
                    {matchError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-verify-btn"
                style={{
                  fontFamily: "var(--font-title)",
                  opacity: pwError || matchError || !confirmPassword ? 0.5 : 1,
                  cursor:
                    pwError || matchError || !confirmPassword
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={pwError || matchError || !confirmPassword}
              >
                비밀번호 변경 완료
              </button>
            </form>
          )}

          {/* 하단 푸터 */}
          <div className="find-footer">
            <Link to="/login" className="back-to-login">
              ← 로그인 화면으로 돌아가기
            </Link>
            <div className="footer-logo">GreenCarry</div>
          </div>
        </section>

        {/* 우측 빈 섹션 (정중앙 정렬 균형용) */}
        <section
          className="illustration-section"
          style={{ width: "320px", visibility: "hidden" }}
        ></section>
      </div>
    </div>
  );
};

export default Account;
