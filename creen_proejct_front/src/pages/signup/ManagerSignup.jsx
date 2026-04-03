import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from "react-daum-postcode";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";
import Swal from "sweetalert2";
import useEcoEffects from "../../hooks/useEcoEffects";
import "./ManagerSignup.module.css";

const ManagerSignup = () => {
  // 🌟 leafData(나뭇잎 효과) 추가
  const {
    containerRef,
    bubblesRef,
    selectedBg,
    bubbleData,
    leafData,
    fireflyData,
  } = useEcoEffects();
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberPhone: "",
    memberEmail: "",
    storeOwnerNo: "",
    storeName: "",
    openingDate: "",
  });
  const [memberPwRe, setMemberPwRe] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkId, setCheckId] = useState(0);
  const [mailAuth, setMailAuth] = useState(0);
  const [checkStoreOwnerNo, setCheckStoreOwnerNo] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");
  const [time, setTime] = useState(180);
  const [timeout, setTimeout] = useState(null);
  const [checkEmail, setCheckEmail] = useState(0);

  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const inputMember = (e) => {
    const { name, value } = e.target;
    // 1. 휴대폰 번호 자동 하이픈
    if (name === "memberPhone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedPhone = "";
      if (onlyNums.length < 4) formattedPhone = onlyNums;
      else if (onlyNums.length < 8)
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
      setMember({ ...member, [name]: formattedPhone });
      return;
    }

    // 2. 사업자 번호 자동 하이픈
    if (name === "storeOwnerNo") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedStoreNo = "";
      if (onlyNums.length < 4) formattedStoreNo = onlyNums;
      else if (onlyNums.length < 6)
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 5)}-${onlyNums.slice(5, 10)}`;
      setMember({ ...member, [name]: formattedStoreNo });
      setCheckStoreOwnerNo(0);
      return;
    }

    setMember({ ...member, [name]: value });
    if (name === "memberId") setCheckId(0);
    if (name === "memberEmail") setMailAuth(0);
  };

  const handleIdCheck = () => {
    if (!idRegex.test(member.memberId)) {
      Swal.fire({ icon: "warning", text: "아이디 형식을 먼저 맞춰주세요." });
      return;
    }
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/member/exists?memberId=${member.memberId}`,
      )
      .then((res) => {
        if (res.data) {
          Swal.fire({ icon: "success", text: "사용 가능한 아이디입니다." });
          setCheckId(2);
        } else {
          Swal.fire({ icon: "error", text: "이미 사용중인 아이디입니다!" });
          setCheckId(1);
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "서버와 통신 중 오류가 발생했습니다.",
        });
      });
  };

  const handleSendMail = async () => {
    if (!emailRegex.test(member.memberEmail)) {
      Swal.fire({
        icon: "warning",
        text: "올바른 이메일 형식을 먼저 입력해주세요.",
      });
      return;
    }
    if (checkEmail === 0) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/member/emailDupCheck?memberEmail=${member.memberEmail}`,
        );
        if (res.data) setCheckEmail(2);
        else {
          Swal.fire({ icon: "error", text: "이미 사용중인 이메일입니다." });
          setCheckEmail(1);
          return;
        }
      } catch (err) {
        return;
      }
    }
    setTime(180);
    if (timeout) window.clearInterval(timeout);
    setMailAuth(1);
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/member/email-verification`, {
        memberEmail: member.memberEmail,
      })
      .then((res) => {
        setMailAuthCode(res.data);
        setMailAuth(2);
        const intervalId = window.setInterval(() => {
          setTime((prev) => prev - 1);
        }, 1000);
        setTimeout(intervalId);
      })
      .catch((err) => {
        Swal.fire({ icon: "error", text: "메일 발송 중 오류가 발생했습니다." });
      });
  };

  const handleVerifyMail = () => {
    if (mailAuth !== 2) {
      Swal.fire({
        icon: "warning",
        text: "먼저 인증 이메일 전송 버튼을 눌러주세요.",
      });
      return;
    }
    if (String(mailAuthCode) === mailAuthInput) {
      Swal.fire({ icon: "success", text: "이메일 인증이 완료되었습니다!" });
      setMailAuth(3);
      window.clearInterval(timeout);
      setTimeout(null);
    } else {
      Swal.fire({
        icon: "error",
        text: "인증번호가 일치하지 않습니다. 다시 확인해주세요.",
      });
    }
  };

  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeout);
      setMailAuthCode(null);
      setTimeout(null);
      Swal.fire({
        icon: "error",
        text: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
      });
      setMailAuth(0);
    }
  }, [time]);

  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleStoreOwnerNoCheck = () => {
    if (member.storeOwnerNo.length < 12) {
      Swal.fire({
        icon: "warning",
        text: "사업자번호 10자리를 모두 입력해주세요.",
      });
      return;
    }
    storeDupCheck();
  };

  const storeDupCheck = () => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/member/storeDupCheck?storeOwnerNo=${member.storeOwnerNo}`,
      )
      .then((res) => {
        if (res.data === null || res.data === "") {
          Swal.fire({ icon: "success", text: "가입 가능한 사업자번호입니다!" });
          setCheckStoreOwnerNo(2);
        } else {
          Swal.fire({ icon: "error", text: "중복된 사업자 번호 입니다." });
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "사업자 번호 중복 확인 중 서버 오류가 발생했습니다.",
        });
      });
  };

  const getIdMessage = () => {
    if (!member.memberId)
      return {
        text: isSubmitted ? "아이디를 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!idRegex.test(member.memberId))
      return { text: "영문, 숫자 조합 8자 이상 입력해주세요.", isError: true };
    if (checkId !== 2)
      return { text: "중복 확인 버튼을 눌러주세요.", isError: true };
    return { text: "사용 가능한 아이디입니다.", isError: false };
  };
  const getPwMessage = () => {
    if (!member.memberPw)
      return {
        text: isSubmitted ? "비밀번호를 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!pwRegex.test(member.memberPw))
      return {
        text: "영문 대/소문자, 숫자, 특수기호 포함 10자 이상 입력해주세요.",
        isError: true,
      };
    return { text: "사용 가능한 비밀번호입니다.", isError: false };
  };
  const getPwReMessage = () => {
    if (!memberPwRe)
      return {
        text: isSubmitted ? "비밀번호 확인을 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (member.memberPw !== memberPwRe)
      return { text: "비밀번호와 일치하지 않습니다.", isError: true };
    return { text: "비밀번호와 일치합니다.", isError: false };
  };
  const getEmailMessage = () => {
    if (!member.memberEmail)
      return {
        text: isSubmitted ? "이메일을 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!emailRegex.test(member.memberEmail))
      return { text: "올바른 이메일 형식을 입력해주세요.", isError: true };
    if (mailAuth === 0)
      return { text: "인증 이메일을 전송해주세요.", isError: true };
    if (mailAuth === 2)
      return {
        text: `인증번호를 입력하세요. (남은 시간: ${showTime()})`,
        isError: true,
      };
    if (mailAuth === 3)
      return { text: "이메일 인증이 완료되었습니다.", isError: false };
    return { text: "\u00A0", isError: false };
  };
  const getStoreOwnerNoMessage = () => {
    if (!member.storeOwnerNo.trim())
      return {
        text: isSubmitted ? "사업자번호를 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (member.storeOwnerNo.length < 12)
      return { text: "사업자번호 10자리를 모두 입력해주세요.", isError: true };
    if (checkStoreOwnerNo !== 2)
      return { text: "사업자번호 중복 확인을 눌러주세요.", isError: true };
    return { text: "가입 가능한 사업자 번호입니다.", isError: false };
  };
  const getPhoneMessage = () => {
    if (!member.memberPhone.trim())
      return {
        text: isSubmitted ? "휴대폰 번호를 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (member.memberPhone.length < 13)
      return { text: "연락처 11자리를 모두 입력해주세요.", isError: true };
    return { text: "\u00A0", isError: false };
  };
  const getStoreNameMessage = () => {
    if (!member.storeName.trim())
      return {
        text: isSubmitted ? "상호명을 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  const getMemberNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? "대표자성명을 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  const getOpeningDateMessage = () => {
    if (!member.openingDate.trim())
      return {
        text: isSubmitted ? "개업일자를 선택하세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const storeOwnerNoStatus = getStoreOwnerNoMessage();
  const storeNameStatus = getStoreNameMessage();
  const memberNameStatus = getMemberNameMessage();
  const phoneStatus = getPhoneMessage();
  const openingDateStatus = getOpeningDateMessage();

  const joinSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberPhone.trim() ||
      !member.storeOwnerNo.trim() ||
      !member.storeName.trim() ||
      !member.memberName.trim() ||
      !member.openingDate.trim();
    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      phoneStatus.isError ||
      storeOwnerNoStatus.isError ||
      storeNameStatus.isError ||
      memberNameStatus.isError ||
      openingDateStatus.isError
    ) {
      Swal.fire({
        icon: "warning",
        text: "입력하신 정보를 다시 확인해주세요.",
      });
      return;
    }
    const submitData = { ...member, memberGrade: 2 };
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/member/signupManager`,
        submitData,
      )
      .then((res) => {
        Swal.fire({
          icon: "success",
          text: "사업자 회원가입이 완료되었습니다!",
        }).then(() => {
          navigate("/login");
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "회원가입 처리 중 오류가 발생했습니다.",
        });
      });
  };

  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setMember({ ...member, openingDate: `${year}-${month}-${day}` });
    setShowCalendar(false);
  };

  return (
    <div
      className="signup-screen-container"
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {/* 🍃 마우스 나뭇잎 효과 */}
      {leafData &&
        leafData.map((leaf) => (
          <div
            key={leaf.id}
            className="particle-leaf"
            style={{ left: leaf.x, top: leaf.y }}
          />
        ))}
      {fireflyData &&
        fireflyData.map((style, i) => (
          <div
            key={`firefly-${i}`}
            className="firefly"
            style={{
              left: style.left,
              top: style.top,
              animationDuration: style.animationDuration,
              animationDelay: style.animationDelay,
            }}
          />
        ))}

      {/* 🫧 에코 버블 */}
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

      <div className="signup-main-content">
        <header>
          <h1 className="signup-logo" onClick={() => navigate("/")}>
            GreenCarry
          </h1>
        </header>

        {/* 🌟 상세폼이므로 스크롤 지원 카드 적용 */}
        <div className="signup-card signup-card-scroll">
          <h2 className="signup-title">사업자 회원가입</h2>

          <form className="signup-form" onSubmit={joinSubmit}>
            {/* 아이디 */}
            <div className="signup-field-group">
              <label className="signup-label">아이디</label>
              <div className="signup-input-area">
                <div className="signup-input-inner">
                  <input
                    type="text"
                    name="memberId"
                    value={member.memberId}
                    onChange={inputMember}
                    className="signup-input-underline"
                    placeholder="영문, 숫자 조합 8자 이상"
                    readOnly={checkId === 2}
                  />
                  <button
                    type="button"
                    className="signup-btn-outlined"
                    onClick={handleIdCheck}
                    disabled={checkId === 2}
                  >
                    중복 확인
                  </button>
                </div>
                <p
                  className={`signup-status-msg ${idStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {idStatus.text}
                </p>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="signup-field-group">
              <label className="signup-label">비밀번호</label>
              <div className="signup-input-area">
                <input
                  type="password"
                  name="memberPw"
                  value={member.memberPw}
                  onChange={inputMember}
                  className="signup-input-underline"
                  placeholder="영문 대/소문자, 숫자, 특수기호 포함 10자 이상"
                />
                <p
                  className={`signup-status-msg ${pwStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {pwStatus.text}
                </p>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="signup-field-group">
              <label className="signup-label">비밀번호 확인</label>
              <div className="signup-input-area">
                <input
                  type="password"
                  name="memberPwRe"
                  value={memberPwRe}
                  onChange={(e) => setMemberPwRe(e.target.value)}
                  className="signup-input-underline"
                  placeholder="비밀번호 재입력"
                />
                <p
                  className={`signup-status-msg ${pwReStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {pwReStatus.text}
                </p>
              </div>
            </div>

            {/* 이메일 */}
            <div className="signup-field-group">
              <label className="signup-label">이메일</label>
              <div className="signup-input-area">
                <div className="signup-input-inner">
                  <input
                    type="email"
                    name="memberEmail"
                    value={member.memberEmail}
                    onChange={inputMember}
                    className="signup-input-underline"
                    placeholder="example@greencarry.com"
                    readOnly={mailAuth === 3}
                  />
                  <button
                    type="button"
                    className="signup-btn-outlined"
                    onClick={handleSendMail}
                    disabled={mailAuth === 1 || mailAuth === 3}
                  >
                    {mailAuth === 0 ? "인증 메일 전송" : "재전송"}
                  </button>
                </div>
                <div className="signup-input-inner signup-mt-10">
                  <input
                    type="text"
                    className="signup-input-underline"
                    placeholder="인증번호"
                    value={mailAuthInput}
                    onChange={(e) => setMailAuthInput(e.target.value)}
                    disabled={mailAuth !== 2}
                  />
                  <button
                    type="button"
                    className="signup-btn-filled"
                    onClick={handleVerifyMail}
                    disabled={mailAuth !== 2}
                  >
                    인증번호 확인
                  </button>
                </div>
                <p
                  className={`signup-status-msg ${emailStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {emailStatus.text}
                </p>
              </div>
            </div>

            {/* 휴대폰 번호 */}
            <div className="signup-field-group">
              <label className="signup-label">휴대폰 번호</label>
              <div className="signup-input-area">
                <input
                  type="text"
                  name="memberPhone"
                  value={member.memberPhone}
                  onChange={inputMember}
                  className="signup-input-underline"
                  placeholder="숫자만 입력하세요"
                />
                <p
                  className={`signup-status-msg ${phoneStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {phoneStatus.text}
                </p>
              </div>
            </div>

            {/* 사업자 번호 */}
            <div className="signup-field-group">
              <label className="signup-label">사업자 번호</label>
              <div className="signup-input-area">
                <div className="signup-input-inner">
                  <input
                    type="text"
                    name="storeOwnerNo"
                    value={member.storeOwnerNo}
                    onChange={inputMember}
                    className="signup-input-underline"
                    placeholder="숫자만 입력하세요"
                    readOnly={checkStoreOwnerNo === 2}
                  />
                  <button
                    type="button"
                    className="signup-btn-outlined"
                    onClick={handleStoreOwnerNoCheck}
                    disabled={checkStoreOwnerNo === 2}
                  >
                    중복 확인
                  </button>
                </div>
                <p
                  className={`signup-status-msg ${storeOwnerNoStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {storeOwnerNoStatus.text}
                </p>
              </div>
            </div>

            {/* 상호명 */}
            <div className="signup-field-group">
              <label className="signup-label">상호명</label>
              <div className="signup-input-area">
                <input
                  type="text"
                  name="storeName"
                  value={member.storeName}
                  onChange={inputMember}
                  className="signup-input-underline"
                  placeholder="상호명을 입력하세요"
                />
                <p
                  className={`signup-status-msg ${storeNameStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {storeNameStatus.text}
                </p>
              </div>
            </div>

            {/* 대표자성명 */}
            <div className="signup-field-group">
              <label className="signup-label">대표자성명</label>
              <div className="signup-input-area">
                <input
                  type="text"
                  name="memberName"
                  value={member.memberName}
                  onChange={inputMember}
                  className="signup-input-underline"
                  placeholder="이름을 입력하세요"
                />
                <p
                  className={`signup-status-msg ${memberNameStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {memberNameStatus.text}
                </p>
              </div>
            </div>

            {/* 🌟 개업일자 (달력이 폼을 깨지 않도록 position 설정) */}
            <div className="signup-field-group">
              <label className="signup-label">개업일자</label>
              <div className="signup-input-area">
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <input
                    type="text"
                    name="openingDate"
                    value={member.openingDate}
                    className="signup-input-underline"
                    placeholder="YYYY-MM-DD"
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{ cursor: "pointer", paddingRight: "35px" }}
                  />
                  <CalendarMonthIcon
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      cursor: "pointer",
                      color: "var(--color-brand)",
                    }}
                  />

                  {/* 달력 팝업 */}
                  {showCalendar && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: "0",
                        zIndex: 50,
                        marginTop: "5px",
                        borderRadius: "15px",
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Calendar
                        onChange={handleDateChange}
                        calendarType="gregory"
                        value={
                          member.openingDate
                            ? new Date(member.openingDate)
                            : new Date()
                        }
                        formatDay={(locale, date) =>
                          date.toLocaleString("en", { day: "numeric" })
                        }
                      />
                    </div>
                  )}
                </div>
                <p
                  className={`signup-status-msg ${openingDateStatus.isError ? "signup-error-msg" : ""}`}
                >
                  {openingDateStatus.text}
                </p>
              </div>
            </div>

            {/* 가입 버튼 */}
            <button type="submit" className="signup-btn">
              사업자 회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerSignup;
