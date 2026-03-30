import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; // ✨ SweetAlert2 유지
import "./Login.css";

const Login = () => {
  // 1. 상태 관리: 객체 하나로 묶어서 관리 (memberGrade 기본값 1 유지)
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
  });
  const [activeTab, setActiveTab] = useState("personal");
  const [rememberId, setRememberId] = useState(false);

  // ✨ 라우터 이동을 위한 useNavigate
  const navigate = useNavigate();

  // 🌟 화면이 처음 켜질 때, 로컬 스토리지에 저장된 아이디 확인
  useEffect(() => {
    const savedId = localStorage.getItem("savedUserId");
    if (savedId) {
      setMember((prev) => ({ ...prev, memberId: savedId })); // 기존 상태 유지하며 아이디만 덮어쓰기
      setRememberId(true);
    }
  }, []);

  // 🌟 공통 입력 핸들러
  const inputMember = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  // 🌟 탭 변경 시 회원 등급(grade)도 같이 변경해주는 함수
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMember({ ...member, memberGrade: tab === "personal" ? 1 : 2 });
  };

  // 🌟 로그인 폼 제출 로직 (순수 테스트용)
  const login = () => {
    // 1. 빈 칸 검사 (Swal 적용)
    if (member.memberId === "" || member.memberPw === "") {
      Swal.fire({
        icon: "error",
        title: "아이디와 비밀번호를 입력해주세요.",
      });
      return;
    }

    // 2. 백엔드 통신
    axios
      .post(`http://localhost:10400/api/member/login`, member)
      .then((res) => {
        console.log("DB 통신 결과 (res.data):", res.data); // 결과 확인용 로그

        // 🌟 백엔드가 성공 시 숫자 1을 리턴한다고 가정합니다.
        if (res.data === 1 || res.data > 0) {
          // 성공 알림창
          Swal.fire({
            icon: "success",
            title: "로그인 성공!",
            showConfirmButton: false,
            timer: 1500,
          });

          // 아이디 저장 체크박스 처리
          if (rememberId) {
            localStorage.setItem("savedUserId", member.memberId);
          } else {
            localStorage.removeItem("savedUserId");
          }

          // 메인 페이지로 이동
          navigate("/");
        } else {
          // 백엔드에서 0 또는 실패 값을 돌려줬을 때
          Swal.fire({
            title: "로그인 실패",
            text: "아이디 또는 비밀번호가 틀렸습니다.",
            icon: "error",
          });
        }
      })
      .catch((err) => {
        console.error("로그인 에러:", err);
        Swal.fire({
          title: "통신 실패",
          text: "서버 연결에 실패했습니다.",
          icon: "error",
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
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          GreenCarry
        </Link>
      </h1>

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

          {/* 탭 버튼 */}
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

          {/* 🌟 폼 제출 */}
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            autoComplete="off"
          >
            <input
              type="text"
              name="memberId"
              placeholder="아이디를 입력하세요"
              value={member.memberId}
              onChange={inputMember}
            />
            <input
              type="password"
              name="memberPw"
              placeholder="비밀번호를 입력하세요"
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
