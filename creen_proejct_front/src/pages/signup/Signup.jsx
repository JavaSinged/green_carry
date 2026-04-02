import styles from "./Signup.module.css";
import { useNavigate } from "react-router-dom";
import useEcoEffects from "../../hooks/useEcoEffects";
const Signup = () => {
  const { containerRef, bubblesRef, selectedBg, bubbleData } = useEcoEffects();
  const navigate = useNavigate();

  return (
    <div
      className={styles.signup_container}
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
      {/* 화면 최상단 로고 - 클릭 시 홈으로 */}
      <header className={styles.header}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>
          GreenCarry
        </h1>
      </header>

      {/* 중앙 카드 세션 */}
      <main className={styles.option_paper}>
        <h2 className={styles.option_card_title}>회원가입</h2>

        <div className={styles.button_wrap}>
          <button
            className={styles.reg_button}
            onClick={() => navigate("/userSignup")}
          >
            개인 회원가입
          </button>

          <button
            className={styles.reg_button}
            onClick={() => navigate("/managerSignup")}
          >
            사업자 회원가입
          </button>
        </div>

        <p className={styles.footer_text}>
          회원 정보를 잊어버리셨나요?
          <span
            className={styles.find_link}
            onClick={() => navigate("/account")}
          >
            아이디/비밀번호 찾기
          </span>
        </p>
      </main>
    </div>
  );
};

export default Signup;
