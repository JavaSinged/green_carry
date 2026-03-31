import React, { useState } from "react";
import styles from "./UserSignup.module.css";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from "react-daum-postcode";
import axios from "axios";

const UserSignup = () => {
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberEmail: "",
    memberAddrCode: "",
    memberAddr: "",
    memberDetailAddr: "",
  });

  // 정규식 모음
  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  //아이디 중복검사용(0:중복검사전, 1:아이디 중복, 2: 사용가능한 아이디)
  const [checkId, setCheckId] = useState(0);

  //비번확인용
  const [memberPwRe, setMemberPwRe] = useState("");
  //이메일 인증 상태관리용
  const [mailAuth, setMailAuth] = useState(0); //0:메일전송 누르기 전, 1: 전송완료(코드받기 전), 2: 전송완료(코드받은 후), 3: 인증완료된 상태
  const [mailAuthCode, setMailAuthCode] = useState(null); //인증번호 저장용
  const [mailAuthInput, setMailAuthInput] = useState(""); //인증번호 input입력값
  //인증 유효시간 처리
  const [time, setTime] = useState(180); // 메일인증 유효시간 3분(180초)
  const [timeout, setTimeout] = useState(null);

  // 제출 버튼 클릭 여부 (이 값을 기준으로 빈 칸 에러 표시)
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inputMember = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });

    // 입력값이 바뀌면 중복확인 및 이메일 인증 상태 초기화
    if (name === "memberId") setCheckId(0);
    if (name === "memberEmail") setMailAuth(0);
  };

  // 아이디 중복체크
  const handleIdCheck = () => {
    // 1. 먼저 정규표현식으로 형식 검사
    if (!idRegex.test(member.memberId)) {
      alert("아이디 형식을 먼저 맞춰주세요.");
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/api/member/exists?memberId=${member.memberId}`,
      )
      .then((res) => {
        console.log("중복 체크 결과:", res);

        // res.data가 true면 중복(사용 불가), false면 사용 가능으로 가정
        if (res.data) {
          alert("사용 가능한 아이디입니다.");
          setCheckId(2); // 사용가능
        } else {
          alert("이미 사용중인 아이디입니다!");
          setCheckId(1); // 아이디 중복
        }
      })
      .catch((err) => {
        console.error("통신 에러:", err);
        alert("서버와 통신 중 오류가 발생했습니다.");
      });
  };

  // 💡 [복구] 이메일 인증 전송 가짜 로직
  const handleSendMail = () => {
    //형식검사
    if (!emailRegex.test(member.memberEmail)) {
      alert("올바른 이메일 형식을 먼저 입력해주세요.");
      return;
    }
    alert("인증 메일이 전송되었습니다. (테스트용: 아무 번호나 입력하세요)");
    setMailAuth(1);
  };

  // 💡 [복구] 이메일 인증번호 확인 가짜 로직
  const handleVerifyMail = () => {
    if (mailAuth !== 1) {
      alert("먼저 인증 이메일 전송 버튼을 눌러주세요.");
      return;
    }
    alert("이메일 인증이 완료되었습니다! (UI 테스트)");
    setMailAuth(3);
  };

  // 우편번호 API 설정
  const openPostcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
  );
  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";
    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
    setMember((prev) => ({
      ...prev,
      memberAddrCode: data.zonecode,
      memberAddr: fullAddress,
    }));
  };
  const handleSearchAddress = () => {
    openPostcode({ onComplete: handleCompletePostcode });
  };

  // 실시간 상태 체크 함수 (빈 칸일 때는 isSubmitted가 true일 때만 에러로 취급)
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

  const getNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? "이름을 입력하세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const getAddrMessage = () => {
    if (!member.memberAddrCode || !member.memberDetailAddr.trim())
      return {
        text: isSubmitted ? "주소 및 상세 주소를 모두 입력해주세요." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const nameStatus = getNameMessage();
  const addrStatus = getAddrMessage();

  const joinSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true); // 제출 버튼 클릭 기록

    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberName.trim() ||
      !member.memberAddrCode ||
      !member.memberDetailAddr.trim();

    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      nameStatus.isError ||
      addrStatus.isError
    ) {
      alert("입력하신 정보를 다시 확인해주세요.");
      return;
    }

    console.log("가입 진행 데이터:", member);
    alert("모든 절차를 통과했습니다! 회원가입 완료! (UI 테스트)");
    navigate("/member/login");
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
        <h1 className={styles.title}>개인 회원가입</h1>

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
                  readOnly={checkId === 2} // 중복확인 완료 시 수정 불가
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

          {/* 이름 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이름 *</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="memberName"
                value={member.memberName}
                onChange={inputMember}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${nameStatus.isError ? styles.errorMessage : ""}`}
              >
                {nameStatus.text}
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
                  readOnly={mailAuth === 3} // 인증 완료 시 수정 불가
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

          {/* 주소 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>주소</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                {/* 🚨 기존 textCenter 제거하여 기본 왼쪽 정렬 유지 */}
                <input
                  type="text"
                  placeholder="우편번호"
                  name="memberAddrCode"
                  value={member.memberAddrCode}
                  className={styles.inputUnderline}
                  readOnly
                />
                <button
                  type="button"
                  className={styles.buttonFilled}
                  onClick={handleSearchAddress}
                >
                  우편번호 검색
                </button>
              </div>
              <div className={`${styles.inputAreaInner} ${styles.mt10}`}>
                <input
                  type="text"
                  placeholder="주소"
                  name="memberAddr"
                  value={member.memberAddr}
                  className={styles.inputUnderline}
                  readOnly
                />
              </div>
              <div className={`${styles.inputAreaInner} ${styles.mt10}`}>
                <input
                  type="text"
                  placeholder="상세주소"
                  name="memberDetailAddr"
                  value={member.memberDetailAddr}
                  onChange={inputMember}
                  className={styles.inputUnderline}
                />
              </div>
              <p
                className={`${styles.statusMessage} ${addrStatus.isError ? styles.errorMessage : ""}`}
              >
                {addrStatus.text}
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

export default UserSignup;
