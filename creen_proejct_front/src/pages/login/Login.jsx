import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Login.css";

// MUI Icons & Components
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

const Login = () => {
  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberGrade: 1,
  });
  const [activeTab, setActiveTab] = useState("personal");
  const [rememberId, setRememberId] = useState(false);

  const containerRef = useRef(null);
  const bubblesRef = useRef([]);

  const swalCustomClass = {
    popup: "greencarry-swal-popup",
    title: "greencarry-swal-title",
    confirmButton: "greencarry-swal-confirm-button",
  };

  const bgImages = [
    "/image/login/lo.jpg",
    "/image/login/lo2.jpg",
    "/image/login/lo3.jpg",
    "/image/login/f.jpg",
    "/image/login/f2.jpg",
    "/image/login/lo.webp",
  ];

  const selectedBg = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * bgImages.length);
    return bgImages[randomIndex];
  }, []);

  const bubbleData = useMemo(() => {
    return [...Array(15)].map(() => ({
      left: `${Math.random() * 90}%`,
      top: `${Math.random() * 90}%`,
      size: `${Math.random() * 20 + 10}px`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      if (Math.random() > 0.88) {
        const leaf = document.createElement("span");
        leaf.classList.add("particle-leaf");
        leaf.style.left = `${x}px`;
        leaf.style.top = `${y}px`;
        const size = Math.random() * 10 + 10;
        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;
        leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(leaf);
        setTimeout(() => leaf.remove(), 1500);
      }

      bubblesRef.current.forEach((bubble) => {
        if (!bubble) return;
        const rect = bubble.getBoundingClientRect();
        const bX = rect.left + rect.width / 2;
        const bY = rect.top + rect.height / 2;
        const dist = Math.hypot(x - bX, y - bY);

        if (dist < 150) {
          const angle = Math.atan2(y - bY, x - bX);
          const force = (150 - dist) / 2;
          const moveX = -Math.cos(angle) * force;
          const moveY = -Math.sin(angle) * force;
          bubble.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.2)`;
          bubble.style.transition = "transform 0.2s ease-out";
        } else {
          bubble.style.transform = `translate(0, 0) scale(1)`;
          bubble.style.transition = "transform 1s ease-in-out";
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMember((prev) => ({ ...prev, memberGrade: tab === "personal" ? 1 : 2 }));
  };

  const login = () => {
    const { memberId, memberPw } = member;

    if (!memberId || !memberPw) {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "아이디와 비밀번호를 모두 입력해주세요.",
        customClass: swalCustomClass,
      });
      return;
    }

    // 아이디 정규식
    const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!idRegex.test(memberId) && memberId !== "admin1111") {
      Swal.fire({
        icon: "error",
        title: "아이디 형식 오류",
        text: "아이디는 영문과 숫자를 포함하여 8자 이상이어야 합니다.",
        customClass: swalCustomClass,
      });
      return;
    }

    // 비밀번호 정규식
    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/;
    if (!pwRegex.test(memberPw) && memberId !== "admin1111") {
      Swal.fire({
        icon: "warning",
        title: "비밀번호 보안 수준 미달",
        html: `비밀번호 형식이 올바르지 않습니다.<br/><small>(대/소문자, 숫자, 특수문자 포함 10자 이상)</small>`,
        customClass: swalCustomClass,
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/member/login`, member)
      .then((res) => {
        const { member: loginUser, accessToken } = res.data;

        if (loginUser && Number(loginUser.memberStatus) === 2) {
          Swal.fire({
            icon: "error",
            title: "로그인 불가",
            text: "탈퇴한 회원입니다. 다시 이용하시려면 고객센터에 문의해주세요.",
            customClass: swalCustomClass,
          });
          return;
        }

        if (loginUser && accessToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("memberId", loginUser.memberId);
          localStorage.setItem("memberName", loginUser.memberName);
          localStorage.setItem("memberGrade", loginUser.memberGrade);
          localStorage.setItem("memberThumb", loginUser.memberThumb);

          if (rememberId) localStorage.setItem("savedUserId", memberId);
          else localStorage.removeItem("savedUserId");

          let welcomeTitle = "";
          let welcomeHtml = "";
          let targetPath = "/";
          const grade = Number(loginUser.memberGrade);

          if (grade === 0) {
            welcomeTitle = "관리자 시스템 접속";
            welcomeHtml = `<b style="color: #2e7d32;">관리자님</b> 환영합니다! <br/>그린캐리 관리자 모드로 로그인되었습니다.`;
            targetPath = "/mypage/admin";
          } else if (grade === 2) {
            welcomeTitle = "파트너 센터 접속";
            welcomeHtml = `<b>${loginUser.memberName}</b> 사장님! <br/>매장 관리 화면으로 이동합니다.`;
            targetPath = "/mypage/manager";
          } else {
            welcomeTitle = "로그인 성공!";
            welcomeHtml = `<b>${loginUser.memberName}</b> 에코 히어로님! 환영합니다!<br/>메인 페이지로 이동합니다.`;
            targetPath = "/";
          }

          Swal.fire({
            icon: "success",
            title: welcomeTitle,
            html: welcomeHtml,
            showConfirmButton: false,
            timer: 1500,
            customClass: swalCustomClass,
          }).then(() => {
            window.location.replace(targetPath);
          });
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "로그인 실패",
          text: "정보가 일치하지 않습니다.",
          customClass: swalCustomClass,
        });
      });
  };

  return (
    <div
      className="screen-container"
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      <div className="sun-rays"></div>

      {bubbleData.map((style, i) => (
        <div
          key={i}
          className="eco-bubble"
          ref={(el) => (bubblesRef.current[i] = el)}
          style={{
            left: style.left,
            top: style.top,
            width: style.size,
            height: style.size,
            animationDelay: style.delay,
          }}
        />
      ))}

      <header className="header">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            GreenCarry
          </Link>
        </h1>
      </header>

      <div className="main-content">
        <section className="info-section">
          <h2 className="main-title">
            탄소 발자국을 줄이는
            <br />
            맛있는 한 끼
          </h2>
          <div className="stats">
            <div className="stat-item">
              🌿 오늘 아낀 탄소 <span className="stat-value">1,245kg</span>
            </div>
            <div className="stat-item">
              🌳 식재 효과 <span className="stat-value">156그루</span>
            </div>
          </div>
        </section>

        <section className="login-card">
          <h3 className="card-title">반가워요, 에코 히어로!</h3>
          <h2 className="card-info blooming-text">
            로그인하여 <span className="leaf-point">친</span>환경 배달을
            시작하세요
          </h2>

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
            <TextField
              fullWidth
              variant="outlined"
              name="memberId"
              placeholder="아이디를 입력해주세요."
              value={member.memberId}
              onChange={inputMember}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon style={{ color: "#2e7d32" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              type="password"
              name="memberPw"
              placeholder="비밀번호를 입력해주세요."
              value={member.memberPw}
              onChange={inputMember}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon style={{ color: "#2e7d32" }} />
                  </InputAdornment>
                ),
              }}
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

        <section className="illustration-section">
          <div className="speech-bubble">
            <p>현재 456명이 환경을 지키고 있어요!</p>
          </div>
          <div className="character-illustration">
            <img src="/image/logo.png" alt="Logo" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
