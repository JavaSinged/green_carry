import React, { useState } from "react";
import styles from "./ManagerSignup.module.css";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";

const ManagerSignup = () => {
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberPhone: "", // 💡 연락처 추가
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

  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const storeOwnerNoRegex = /^\d{3}-\d{2}-\d{5}$/;
  // 연락처 정규식 검사는 요청에 따라 제외함

  const inputMember = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });

    if (name === "memberId") setCheckId(0);
    if (name === "memberEmail") setMailAuth(0);
    if (name === "storeOwnerNo") setCheckStoreOwnerNo(0);
  };

  const handleIdCheck = () => {
    if (!idRegex.test(member.memberId)) {
      alert("아이디 형식을 먼저 맞춰주세요.");
      return;
    }
    alert("사용 가능한 아이디입니다! (UI 테스트)");
    setCheckId(2);
  };

  const handleSendMail = () => {
    if (!emailRegex.test(member.memberEmail)) {
      alert("올바른 이메일 형식을 먼저 입력해주세요.");
      return;
    }
    alert("인증 메일이 전송되었습니다. (테스트용: 아무 번호나 입력하세요)");
    setMailAuth(1);
  };

  const handleVerifyMail = () => {
    if (mailAuth !== 1) {
      alert("먼저 인증 이메일 전송 버튼을 눌러주세요.");
      return;
    }
    alert("이메일 인증이 완료되었습니다! (UI 테스트)");
    setMailAuth(3);
  };

  const handleStoreOwnerNoCheck = () => {
    if (!storeOwnerNoRegex.test(member.storeOwnerNo)) {
      alert("사업자번호를 000-00-00000 형식으로 입력해주세요.");
      return;
    }
    alert("가입 가능한 사업자번호입니다! (UI 테스트)");
    setCheckStoreOwnerNo(2);
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
    if (mailAuth === 1)
      return { text: "인증번호를 입력하고 확인을 눌러주세요.", isError: true };
    return { text: "이메일 인증이 완료되었습니다.", isError: false };
  };

  const getStoreOwnerNoMessage = () => {
    if (!member.storeOwnerNo)
      return {
        text: isSubmitted ? "사업자번호를 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    if (!storeOwnerNoRegex.test(member.storeOwnerNo))
      return { text: "000-00-00000 형식으로 입력해주세요.", isError: true };
    if (checkStoreOwnerNo !== 2)
      return { text: "사업자번호 중복 확인을 눌러주세요.", isError: true };
    return { text: "가입 가능한 사업자 번호입니다.", isError: false };
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

  // 💡 연락처 메시지 함수 (유효성 검사 없이 빈 칸만 체크)
  const getPhoneMessage = () => {
    if (!member.memberPhone.trim())
      return {
        text: isSubmitted ? "연락처를 입력하세요." : "\u00A0",
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
  const phoneStatus = getPhoneMessage(); // 💡 연락처 상태 추가
  const openingDateStatus = getOpeningDateMessage();

  const joinSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberPhone.trim() || // 💡 빈칸 체크 추가
      !member.storeOwnerNo ||
      !member.storeName.trim() ||
      !member.memberName.trim() ||
      !member.openingDate.trim();

    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      phoneStatus.isError || // 💡 에러 체크 추가
      storeOwnerNoStatus.isError ||
      storeNameStatus.isError ||
      memberNameStatus.isError ||
      openingDateStatus.isError
    ) {
      alert("입력하신 정보를 다시 확인해주세요.");
      return;
    }

    // 💡 백엔드 전송용 데이터 가공
    const submitData = {
      ...member,
      // 백엔드가 Long 타입으로 받으므로 하이픈 제거 "123-45-67890" -> "1234567890"
      storeOwnerNo: member.storeOwnerNo.replace(/-/g, ""),
      memberGrade: 2,
    };

    // 💡 axios POST 요청
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/api/member/signupManager`,
        submitData,
      )
      .then((res) => {
        console.log(res);
        alert("사업자 회원가입이 완료되었습니다!");
        navigate("/member/login");
      })
      .catch((err) => {
        console.error("회원가입 에러:", err);
        alert("회원가입 처리 중 오류가 발생했습니다.");
      });
  };

  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    setMember({ ...member, openingDate: formattedDate });
    setShowCalendar(false);
  };

  return (
    <div className={styles.signupPage}>
      <h1
        className={styles.mainLogo}
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        GreenCarry
      </h1>

      <div className={styles.card}>
        <h1 className={styles.title}>사업자 회원가입</h1>

        <form className={styles.form} onSubmit={joinSubmit}>
          {/* 아이디 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>아이디 *</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                <input
                  type="text"
                  name="memberId"
                  value={member.memberId}
                  onChange={inputMember}
                  className={styles.inputUnderline}
                  placeholder="영문, 숫자 조합 8자 이상"
                  readOnly={checkId === 2}
                />
                <button
                  type="button"
                  className={styles.buttonOutlined}
                  onClick={handleIdCheck}
                  disabled={checkId === 2}
                >
                  중복 확인
                </button>
              </div>
              <p
                className={`${styles.statusMessage} ${idStatus.isError ? styles.errorMessage : ""}`}
                style={!idStatus.isError ? { color: "#3a8a56" } : {}}
              >
                {idStatus.text}
              </p>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호 *</label>
            <div className={styles.inputArea}>
              <input
                type="password"
                name="memberPw"
                value={member.memberPw}
                onChange={inputMember}
                className={styles.inputUnderline}
                placeholder="영문 대/소문자, 숫자, 특수기호 포함 10자 이상"
              />
              <p
                className={`${styles.statusMessage} ${pwStatus.isError ? styles.errorMessage : ""}`}
                style={!pwStatus.isError ? { color: "#3a8a56" } : {}}
              >
                {pwStatus.text}
              </p>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호확인</label>
            <div className={styles.inputArea}>
              <input
                type="password"
                name="memberPwRe"
                value={memberPwRe}
                onChange={(e) => setMemberPwRe(e.target.value)}
                className={styles.inputUnderline}
                placeholder="비밀번호 재입력"
              />
              <p
                className={`${styles.statusMessage} ${pwReStatus.isError ? styles.errorMessage : ""}`}
                style={!pwReStatus.isError ? { color: "#3a8a56" } : {}}
              >
                {pwReStatus.text}
              </p>
            </div>
          </div>

          {/* 이메일 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이메일 *</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                <input
                  type="email"
                  name="memberEmail"
                  value={member.memberEmail}
                  onChange={inputMember}
                  className={styles.inputUnderline}
                  placeholder="example@greencarry.com"
                  readOnly={mailAuth === 3}
                />
                <button
                  type="button"
                  className={styles.buttonOutlined}
                  onClick={handleSendMail}
                  disabled={mailAuth === 3}
                >
                  인증 이메일 전송
                </button>
              </div>

              <div className={`${styles.inputAreaInner} ${styles.mt10}`}>
                <input
                  type="text"
                  className={styles.inputUnderline}
                  placeholder="인증번호"
                  disabled={mailAuth === 3}
                />
                <button
                  type="button"
                  className={styles.buttonFilled}
                  onClick={handleVerifyMail}
                  disabled={mailAuth === 3}
                >
                  인증번호 확인
                </button>
              </div>

              <p
                className={`${styles.statusMessage} ${emailStatus.isError ? styles.errorMessage : ""}`}
                style={!emailStatus.isError ? { color: "#3a8a56" } : {}}
              >
                {emailStatus.text}
              </p>
            </div>
          </div>

          {/* 💡 추가된 연락처 입력란 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>연락처 *</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="memberPhone"
                value={member.memberPhone}
                onChange={inputMember}
                className={styles.inputUnderline}
                placeholder="(-)을 제외한 숫자 11자리를 입력하세요"
              />
              <p
                className={`${styles.statusMessage} ${phoneStatus.isError ? styles.errorMessage : ""}`}
              >
                {phoneStatus.text}
              </p>
            </div>
          </div>

          {/* 사업자번호 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>사업자번호 *</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                <input
                  type="text"
                  name="storeOwnerNo"
                  value={member.storeOwnerNo}
                  onChange={inputMember}
                  className={styles.inputUnderline}
                  placeholder="000-00-00000"
                  readOnly={checkStoreOwnerNo === 2}
                />
                <button
                  type="button"
                  className={styles.buttonOutlined}
                  onClick={handleStoreOwnerNoCheck}
                  disabled={checkStoreOwnerNo === 2}
                >
                  중복 확인
                </button>
              </div>
              <p
                className={`${styles.statusMessage} ${storeOwnerNoStatus.isError ? styles.errorMessage : ""}`}
                style={!storeOwnerNoStatus.isError ? { color: "#3a8a56" } : {}}
              >
                {storeOwnerNoStatus.text}
              </p>
            </div>
          </div>

          {/* 상호명 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>상호명 *</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="storeName"
                value={member.storeName}
                onChange={inputMember}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${storeNameStatus.isError ? styles.errorMessage : ""}`}
              >
                {storeNameStatus.text}
              </p>
            </div>
          </div>

          {/* 대표자성명 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>대표자성명 *</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="memberName"
                value={member.memberName}
                onChange={inputMember}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${memberNameStatus.isError ? styles.errorMessage : ""}`}
              >
                {memberNameStatus.text}
              </p>
            </div>
          </div>

          {/* 개업일자 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>개업일자 *</label>
            <div className={styles.inputArea}>
              <div className={styles.dateInputWrapper}>
                <input
                  type="text"
                  name="openingDate"
                  value={member.openingDate}
                  className={`${styles.inputUnderline} ${styles.dateInput}`}
                  placeholder="YYYY-MM-DD"
                  readOnly
                  onClick={() => setShowCalendar(!showCalendar)}
                />

                <CalendarMonthIcon
                  className={styles.muiCalendarIcon}
                  onClick={() => setShowCalendar(!showCalendar)}
                />

                {showCalendar && (
                  <div className={styles.calendarWrapper}>
                    <Calendar
                      onChange={handleDateChange}
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
                className={`${styles.statusMessage} ${openingDateStatus.isError ? styles.errorMessage : ""}`}
              >
                {openingDateStatus.text}
              </p>
            </div>
          </div>

          {/* 가입 버튼 */}
          <div className={styles.submitContainer}>
            <button type="submit" className={styles.submitButton}>
              가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerSignup;
