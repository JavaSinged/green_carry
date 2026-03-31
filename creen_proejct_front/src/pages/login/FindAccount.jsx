import React, { useState } from "react";
import "./FindAccount.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/accessToken";

const Account = () => {
  const navigate = useNavigate();

  // 1. 상태 관리
  const [activeTab, setActiveTab] = useState("findId");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [inputCode, setInputCode] = useState("");

  const [formData, setFormData] = useState({
    memberName: "",
    memberEmail: "",
    memberId: "",
  });

  // 2. 새 비밀번호 관련 상태
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [matchError, setMatchError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsCodeSent(false);
    setIsVerified(false);
    setInputCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setMatchError("");
    setFormData({ memberName: "", memberEmail: "", memberId: "" });
  };

  const sendCode = () => {
    if (!formData.memberEmail) {
      Swal.fire({ icon: "warning", title: "이메일을 입력해주세요." });
      return;
    }

    api
      .post("/api/member/sendAuthCode", {
        memberEmail: formData.memberEmail,
      })
      .then(() => {
        setIsCodeSent(true);
        Swal.fire({
          icon: "success",
          title: "인증번호 발송 완료",
          text: "입력하신 이메일로 인증번호가 발송되었습니다. (3분 이내 입력)",
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "발송 실패",
          text: "이메일 주소를 확인하거나 잠시 후 다시 시도해주세요.",
        });
      });
  };

  const handlePwChange = (val) => {
    setNewPassword(val);
    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (val && !pwRegex.test(val)) {
      setPwError("대/소문자, 숫자, 특수문자 포함 10자 이상이어야 합니다.");
    } else {
      setPwError("");
    }
    if (confirmPassword && val !== confirmPassword) {
      setMatchError("비밀번호가 일치하지 않습니다.");
    } else {
      setMatchError("");
    }
  };

  const handleConfirmPwChange = (val) => {
    setConfirmPassword(val);
    if (newPassword !== val) {
      setMatchError("비밀번호가 일치하지 않습니다.");
    } else {
      setMatchError("");
    }
  };

  // 🌟 [핵심 수정 부분] 중복 코드 모두 제거하고 하나로 합침
  const handleVerifySubmit = (e) => {
    e.preventDefault();

    if (!inputCode) {
      Swal.fire({ icon: "warning", title: "인증번호를 입력해주세요." });
      return;
    }

    // 1. 서버에 인증 확인 요청
    api
      .post("/api/member/verifyCode", {
        memberEmail: formData.memberEmail,
        inputCode: inputCode,
      })
      .then((res) => {
        if (res.data === true || res.data === "true") {
          // 인증번호가 일치하는 경우
          if (activeTab === "findId") {
            api
              .post("/api/member/findId", {
                memberName: formData.memberName,
                memberEmail: formData.memberEmail,
              })
              .then((resId) => {
                Swal.fire({
                  icon: "success",
                  title: "아이디 찾기 성공",
                  html: `고객님의 아이디는 <b>${resId.data}</b> 입니다.`,
                });
              })
              .catch(() => {
                Swal.fire({
                  icon: "error",
                  title: "조회 실패",
                  text: "일치하는 정보가 없습니다.",
                });
              });
          } else {
            // 비밀번호 재설정 탭
            api
              .post("/api/member/checkMember", {
                memberId: formData.memberId,
                memberEmail: formData.memberEmail,
              })
              .then((resCheck) => {
                if (resCheck.data === true || resCheck.data === 1) {
                  setIsVerified(true);
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "인증 실패",
                    text: "정보가 일치하는 회원이 없습니다.",
                  });
                }
              })
              .catch(() => {
                Swal.fire({
                  icon: "error",
                  title: "오류",
                  text: "회원 정보 확인 중 문제가 발생했습니다.",
                });
              });
          }
        } else {
          // 인증번호가 틀린 경우
          Swal.fire({
            icon: "error",
            title: "인증 실패",
            text: "인증번호가 일치하지 않습니다. 다시 확인해주세요.",
          });
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "오류",
          text: "인증 확인 중 문제가 발생했습니다.",
        });
      });
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (pwError || matchError || !newPassword || !confirmPassword) return;

    api
      .post("/api/member/resetPw", {
        memberId: formData.memberId,
        memberPw: newPassword,
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "변경 완료",
          text: "비밀번호가 성공적으로 변경되었습니다.",
        }).then(() => {
          navigate("/login");
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "변경 실패",
          text: "비밀번호 변경 중 오류가 발생했습니다.",
        });
      });
  };

  return (
    <div className="screen-container">
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
              🌱 다시 로그인하여 에코 히어로가 되어주세요.
            </div>
            <div className="stat-item">
              🛡️ 본인 인증을 통해 안전하게 정보를 보호합니다.
            </div>
          </div>
        </section>

        <section className="find-card" style={{ width: "450px" }}>
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
            <form className="find-form" onSubmit={handleVerifySubmit}>
              <input
                type="text"
                name="memberName"
                className="full-input"
                placeholder="이름"
                value={formData.memberName}
                onChange={handleInputChange}
                required
              />
              <div className="input-with-btn">
                <input
                  type="email"
                  name="memberEmail"
                  className="flex-input"
                  placeholder="이메일"
                  value={formData.memberEmail}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="verify-send-btn"
                  onClick={sendCode}
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
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    required
                  />
                  <button type="submit" className="submit-verify-btn">
                    아이디 찾기
                  </button>
                </>
              )}
            </form>
          ) : !isVerified ? (
            <form className="find-form" onSubmit={handleVerifySubmit}>
              <input
                type="text"
                name="memberId"
                className="full-input"
                placeholder="아이디"
                value={formData.memberId}
                onChange={handleInputChange}
                required
              />
              <div className="input-with-btn">
                <input
                  type="email"
                  name="memberEmail"
                  className="flex-input"
                  placeholder="이메일"
                  value={formData.memberEmail}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="verify-send-btn"
                  onClick={sendCode}
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
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    required
                  />
                  <button type="submit" className="submit-verify-btn">
                    인증 확인
                  </button>
                </>
              )}
            </form>
          ) : (
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
                  placeholder="새 비밀번호 (대문자+소문자+숫자+특수문자 10자 이상)"
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

          <div className="find-footer">
            <Link to="/login" className="back-to-login">
              ← 로그인 화면으로 돌아가기
            </Link>
            <div className="footer-logo">GreenCarry</div>
          </div>
        </section>

        <section
          className="illustration-section"
          style={{ width: "320px", visibility: "hidden" }}
        ></section>
      </div>
    </div>
  );
};

export default Account;
