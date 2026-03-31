import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Login.css";

const Login = () => {
  // 1. 상태 관리 (memberGrade 기본값 1 추가)
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberGrade: 1, // 기본값: 개인 이용자(1)
  });
  const [activeTab, setActiveTab] = useState("personal");
  const [rememberId, setRememberId] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      setMember((prev) => ({ ...prev, memberId: savedId }));
      setRememberId(true);
    }
  }, []);

  const inputMember = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  // 🌟 탭 변경 시 등급(1 또는 2) 자동 업데이트
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMember((prev) => ({
      ...prev,
      memberGrade: tab === "personal" ? 1 : 2,
    }));
  };

  // 🌟 유효성 검사 및 로그인 로직
  const login = () => {
    const { memberId, memberPw } = member;

    // 1. 빈 칸 검사
    if (!memberId || !memberPw) {
      Swal.fire({
        icon: "warning",
        title: "아이디와 비밀번호를 입력해주세요.",
      });
      return;
    }

    // 2. 아이디 유효성 검사 (영문+숫자 8자 이상)
    const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!idRegex.test(memberId)) {
      Swal.fire({
        icon: "error",
        title: "아이디 형식 오류",
        text: "아이디는 영문과 숫자를 포함하여 8자 이상이어야 합니다.",
      });
      return;
    }

    // 3. 비밀번호 유효성 검사 (소문자+대문자+숫자+특수문자 10자 이상)
    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!pwRegex.test(memberPw)) {
      Swal.fire({
        icon: "error",
        title: "비밀번호 형식 오류",
        text: "비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함하여 10자 이상이어야 합니다.",
      });
      return;
    }

    // 4. 백엔드 통신
    axios
      .post(`http://localhost:10400/api/member/login`, member)
      .then((res) => {
        console.log("로그인 응답 데이터:", res.data);

        // 🌟 백엔드에서 보낸 Map 구조 분해 할당
        // res.data = { member: {...}, accessToken: "ey..." }
        const { member: loginUser, accessToken } = res.data;

        // 회원이 존재하고 토큰이 정상적으로 넘어왔다면 성공
        if (loginUser && accessToken) {
          // 1. 브라우저 저장소에 중요 정보 보관
          localStorage.setItem("accessToken", accessToken); // 🔑 모든 API 요청에 쓸 토큰
          localStorage.setItem("memberName", loginUser.memberName); // 화면 표시용 이름
          localStorage.setItem("memberGrade", loginUser.memberGrade); // 권한 체크용 등급

          // 2. 등급 텍스트 변환 (1: 개인, 2: 사업자)
          const gradeText =
            loginUser.memberGrade === 1 ? "개인 이용자" : "사업자";

          // 3. 성공 알림창
          Swal.fire({
            icon: "success",
            title: "로그인 성공!",
            html: `<b>${loginUser.memberName}</b>님 (${gradeText}) 환영합니다!`,
            showConfirmButton: false,
            timer: 2000,
          });

          // 4. 아이디 저장 로직 (로그인 시 입력한 member.memberId 사용)
          if (rememberId) {
            localStorage.setItem("savedUserId", member.memberId);
          } else {
            localStorage.removeItem("savedUserId");
          }

          // 5. 메인으로 이동
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("로그인 에러:", err);
        // 401 에러(Unauthorized) 등 실패 상황 처리
        Swal.fire({
          title: "로그인 실패",
          text: "아이디, 비밀번호 또는 회원 유형을 확인해주세요.",
          icon: "error",
        });
      });
  };

  return (
    <div className="screen-container">
      {/* 상단 로고 및 나머지 UI는 기존과 동일 */}
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
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          GreenCarry
        </Link>
      </h1>

      <div className="main-content">
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
              🌿 오늘 아낀 탄소 <span className="stat-value">1,245kg</span>
            </div>
            <div className="stat-item tree">
              🌳 식재 효과 <span className="stat-value">156그루</span>
            </div>
          </div>
        </section>

        <section className="login-card">
          <h3 className="card-title">반가워요, 에코 히어로!</h3>
          <div className="tabs">
            <button
              type="button"
              className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => handleTabChange("personal")}
            >
              개인 이용자
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "business" ? "active" : ""}`}
              onClick={() => handleTabChange("business")}
            >
              사업자
            </button>
          </div>

          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <input
              type="text"
              name="memberId"
              placeholder="아이디 (영문+숫자 8자 이상)"
              value={member.memberId}
              onChange={inputMember}
            />
            <input
              type="password"
              name="memberPw"
              placeholder="비밀번호 (대문자+소문자+숫자+특수문자 10자 이상)"
              value={member.memberPw}
              onChange={inputMember}
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

          <div className="card-footer">
            <Link to="/signup">회원가입</Link>
            <Link to="/account">아이디/비밀번호 찾기</Link>
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
