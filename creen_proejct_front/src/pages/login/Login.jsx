import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Login.css';
import { AuthContext } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person'; // 사람 모양
import LockIcon from '@mui/icons-material/Lock'; // 자물쇠 모양
import InputAdornment from '@mui/material/InputAdornment'; // 아이콘 배치를 위한 컴포넌트
import TextField from '@mui/material/TextField'; // MUI 입력창 (기존 input 대신 사용 권장)

const Login = () => {
  const [member, setMember] = useState({
    memberId: '',
    memberPw: '',
    memberGrade: 1,
  });
  const [activeTab, setActiveTab] = useState('personal');
  const [rememberId, setRememberId] = useState(false);

  const { setIsLogin, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedId = localStorage.getItem('savedUserId');
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
    setMember((prev) => ({
      ...prev,
      memberGrade: tab === 'personal' ? 1 : 2,
    }));
  };

  // 🌟 함수가 하나만 있어야 합니다!
  const login = () => {
    const { memberId, memberPw } = member;

    if (!memberId || !memberPw) {
      Swal.fire({
        icon: 'warning',
        title: '아이디와 비밀번호를 입력해주세요.',
      });
      return;
    }

    // 아이디 형식 검사 (admin1111 예외 처리)
    const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!idRegex.test(memberId) && memberId !== 'admin1111') {
      Swal.fire({
        icon: 'error',
        title: '아이디 형식 오류',
        text: '아이디는 영문과 숫자를 포함하여 8자 이상이어야 합니다.',
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/member/login`, member)
      .then((res) => {
        console.log('로그인 응답 데이터:', res.data);
        const { member: loginUser, accessToken } = res.data;

        if (loginUser && accessToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('memberName', loginUser.memberName);
          localStorage.setItem('memberGrade', loginUser.memberGrade);

          setIsLogin(true);
          setUser({
            memberName: loginUser.memberName,
            memberGrade: loginUser.memberGrade,
          });

          // 🌟 [2] 권한별 메시지 및 이동 경로 설정
          let welcomeTitle = '';
          let welcomeHtml = '';
          let targetPath = '/'; // 기본 메인 페이지

          if (loginUser.memberGrade === 0) {
            // 관리자
            welcomeTitle = '관리자 시스템 접속';
            welcomeHtml = `<b style="color: #2e7d32;">관리자님</b> 환영합니다! <br/>그린캐리 관리자 모드로 로그인되었습니다.
            <br/>관리자 페이지로 이동합니다.`;
            targetPath = '/'; // 🚩 실제 구현 시: targetPath = "/admin/dashboard";
          } else if (loginUser.memberGrade === 2) {
            // 사업자
            welcomeTitle = '파트너 센터 접속';
            welcomeHtml = `<b>${loginUser.memberName}</b> 사장님! <br/>매장 관리 화면으로 이동합니다.`;
            targetPath = '/'; // 🚩 실제 구현 시: targetPath = "/seller/store-manage";
          } else {
            // 개인 사용자 (Grade 1 등)
            welcomeTitle = '로그인 성공!';
            welcomeHtml = `<b>${loginUser.memberName}</b> 에코 히어로님! 환영합니다!<br/>메인 페이지로 이동합니다.`;
            targetPath = '/'; // 🚩 실제 구현 시: targetPath = "/";
          }

          // [3] 환영 알림창 띄우기
          Swal.fire({
            icon: 'success',
            title: welcomeTitle,
            html: welcomeHtml,
            showConfirmButton: false,
            timer: 2000,
          });

          // [4] 아이디 저장 로직 (생략 - 기존과 동일)
          if (rememberId) {
            localStorage.setItem('savedUserId', member.memberId);
          } else {
            localStorage.removeItem('savedUserId');
          }

          // 🌟 [5] 설정된 경로로 이동
          navigate(targetPath);
        }
      })
      .catch((err) => {
        // 에러 처리 (생략 - 기존과 동일)
        console.error('로그인 에러:', err);
        Swal.fire({
          title: '로그인 실패',
          text: '정보를 확인해주세요.',
          icon: 'error',
        });
      });
  };

  return (
    <div className="screen-container">
      <h1
        className="logo"
        style={{
          textAlign: 'center',
          padding: '30px 0',
          margin: 0,
          fontSize: '2.2rem',
          fontWeight: 700,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          GreenCarry
        </Link>
      </h1>

      <div className="main-content">
        <section className="info-section">
          <div className="eco-brand"></div>
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
          <h2 className="card-info">
            로그인하여 <span className="leaf-point">친</span>환경 배달을
            시작하세요
          </h2>
          <div className="tabs">
            <button
              type="button"
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => handleTabChange('personal')}
            >
              개인 이용자
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => handleTabChange('business')}
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
            {/* 아이디 입력창 */}
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
                    <PersonIcon style={{ color: '#2e7d32' }} />{' '}
                    {/* 사람 아이콘 */}
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px', // 기존 디자인과 맞추기 위해 조정
                },
              }}
            />

            {/* 비밀번호 입력창 */}
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
                    <LockIcon style={{ color: '#2e7d32' }} />{' '}
                    {/* 자물쇠 아이콘 */}
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
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
            <img src="/image/logo.png" alt="GreenCarry Logo" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
