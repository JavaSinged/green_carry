import styles from "./Signup.module.css";
import React from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.signup_container}>
      {/* 화면 최상단 로고 */}
      <header className={styles.header}>
        <h1 className={styles.logo}>GreenCarry</h1>
      </header>

      {/* 중앙 카드 세션 */}
      <main className={styles.option_paper}>
        <h2 className={styles.option_card_title}>회원가입</h2>

        <div className={styles.button_wrap}>
          <button
            className={styles.reg_button}
            onClick={() => {
              // 수정: /signup/을 빼고 App.js 경로와 맞춤
              navigate("/userSignup");
            }}
          >
            개인 회원가입
          </button>
          <button
            className={styles.reg_button}
            onClick={() => {
              // 수정: /signup/을 빼고 App.js 경로와 맞춤
              navigate("/managerSignup");
            }}
          >
            사업자 회원가입
          </button>
        </div>

        <p className={styles.footer_text}>
          회원 정보를 잊어버리셨나요?
          <span
            className={styles.find_link}
            onClick={() => {
              navigate("/account");
            }}
          >
            아이디/비밀번호 찾기
          </span>
        </p>
      </main>
    </div>
  );
};

export default Signup;
