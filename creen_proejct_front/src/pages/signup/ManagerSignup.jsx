import React, { useState, useEffect } from 'react';
import styles from './ManagerSignup.module.css';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import Swal from 'sweetalert2';

const ManagerSignup = () => {
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: '',
    memberPw: '',
    memberName: '',
    memberPhone: '',
    memberEmail: '',
    storeOwnerNo: '',
    storeName: '',
    openingDate: '',
  });
  const [memberPwRe, setMemberPwRe] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [checkId, setCheckId] = useState(0);
  const [mailAuth, setMailAuth] = useState(0);
  const [checkStoreOwnerNo, setCheckStoreOwnerNo] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState('');
  const [time, setTime] = useState(180);
  const [timeout, setTimeout] = useState(null);
  const [checkEmail, setCheckEmail] = useState(0);
  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const inputMember = (e) => {
    const { name, value } = e.target;

    // 1. 휴대폰 번호 자동 하이픈 (010-1234-5678)
    if (name === 'memberPhone') {
      const onlyNums = value.replace(/[^0-9]/g, ''); // 숫자만 추출
      let formattedPhone = '';

      if (onlyNums.length < 4) {
        formattedPhone = onlyNums;
      } else if (onlyNums.length < 8) {
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
      }

      setMember({ ...member, [name]: formattedPhone });
      return;
    }

    // 2. 사업자 번호 자동 하이픈 (123-45-67890)
    if (name === 'storeOwnerNo') {
      const onlyNums = value.replace(/[^0-9]/g, ''); // 숫자만 추출
      let formattedStoreNo = '';

      if (onlyNums.length < 4) {
        formattedStoreNo = onlyNums;
      } else if (onlyNums.length < 6) {
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 5)}-${onlyNums.slice(5, 10)}`;
      }

      setMember({ ...member, [name]: formattedStoreNo });
      setCheckStoreOwnerNo(0); // 사업자번호가 수정되면 중복확인 초기화
      return;
    }

    setMember({ ...member, [name]: value });

    if (name === 'memberId') setCheckId(0);
    if (name === 'memberEmail') setMailAuth(0);
  };

  const handleIdCheck = () => {
    if (!idRegex.test(member.memberId)) {
      Swal.fire({ icon: 'warning', text: '아이디 형식을 먼저 맞춰주세요.' });
      return;
    }
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/api/member/exists?memberId=${member.memberId}`,
      )
      .then((res) => {
        if (res.data) {
          Swal.fire({ icon: 'success', text: '사용 가능한 아이디입니다.' });
          setCheckId(2);
        } else {
          Swal.fire({ icon: 'error', text: '이미 사용중인 아이디입니다!' });
          setCheckId(1);
        }
      })
      .catch((err) => {
        console.error('통신 에러:', err);
        Swal.fire({
          icon: 'error',
          text: '서버와 통신 중 오류가 발생했습니다.',
        });
      });
  };

  const handleSendMail = async () => {
    if (!emailRegex.test(member.memberEmail)) {
      Swal.fire({
        icon: 'warning',
        text: '올바른 이메일 형식을 먼저 입력해주세요.',
      });
      return;
    }

    if (checkEmail === 0) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/member/emailDupCheck?memberEmail=${member.memberEmail}`,
        );

        if (res.data) {
          setCheckEmail(2);
        } else {
          Swal.fire({ icon: 'error', text: '이미 사용중인 이메일입니다.' });
          setCheckEmail(1);
          return;
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }

    setTime(180);
    if (timeout) {
      window.clearInterval(timeout);
    }

    setMailAuth(1);

    const obj = { memberEmail: member.memberEmail };
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/member/email-verification`, obj)
      .then((res) => {
        setMailAuthCode(res.data);
        setMailAuth(2);
        console.log(res.data);

        const intervalId = window.setInterval(() => {
          setTime((prev) => prev - 1);
        }, 1000);
        setTimeout(intervalId);
      })
      .catch((err) => {
        console.error('메일 발송 에러:', err);
        Swal.fire({ icon: 'error', text: '메일 발송 중 오류가 발생했습니다.' });
      });
  };

  const handleVerifyMail = () => {
    if (mailAuth !== 2) {
      Swal.fire({
        icon: 'warning',
        text: '먼저 인증 이메일 전송 버튼을 눌러주세요.',
      });
      return;
    }

    if (String(mailAuthCode) === mailAuthInput) {
      Swal.fire({ icon: 'success', text: '이메일 인증이 완료되었습니다!' });
      setMailAuth(3);
      window.clearInterval(timeout);
      setTimeout(null);
    } else {
      Swal.fire({
        icon: 'error',
        text: '인증번호가 일치하지 않습니다. 다시 확인해주세요.',
      });
    }
  };

  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeout);
      setMailAuthCode(null);
      setTimeout(null);
      Swal.fire({
        icon: 'error',
        text: '인증 시간이 만료되었습니다. 다시 시도해주세요.',
      });
      setMailAuth(0);
    }
  }, [time]);

  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleStoreOwnerNoCheck = () => {
    // 💡 길이가 12자(하이픈 포함)인지 검증
    if (member.storeOwnerNo.length < 12) {
      Swal.fire({
        icon: 'warning',
        text: '사업자번호 10자리를 모두 입력해주세요.',
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
        if (res.data === null || res.data === '') {
          Swal.fire({ icon: 'success', text: '가입 가능한 사업자번호입니다!' });
          setCheckStoreOwnerNo(2);
        } else {
          Swal.fire({ icon: 'error', text: '중복된 사업자 번호 입니다.' });
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: 'error',
          text: '사업자 번호 중복 확인 중 서버 오류가 발생했습니다.',
        });
      });
  };

  const getIdMessage = () => {
    if (!member.memberId)
      return {
        text: isSubmitted ? '아이디를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!idRegex.test(member.memberId))
      return { text: '영문, 숫자 조합 8자 이상 입력해주세요.', isError: true };
    if (checkId !== 2)
      return { text: '중복 확인 버튼을 눌러주세요.', isError: true };
    return { text: '사용 가능한 아이디입니다.', isError: false };
  };

  const getPwMessage = () => {
    if (!member.memberPw)
      return {
        text: isSubmitted ? '비밀번호를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!pwRegex.test(member.memberPw))
      return {
        text: '영문 대/소문자, 숫자, 특수기호 포함 10자 이상 입력해주세요.',
        isError: true,
      };
    return { text: '사용 가능한 비밀번호입니다.', isError: false };
  };

  const getPwReMessage = () => {
    if (!memberPwRe)
      return {
        text: isSubmitted ? '비밀번호 확인을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (member.memberPw !== memberPwRe)
      return { text: '비밀번호와 일치하지 않습니다.', isError: true };
    return { text: '비밀번호와 일치합니다.', isError: false };
  };

  const getEmailMessage = () => {
    if (!member.memberEmail)
      return {
        text: isSubmitted ? '이메일을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!emailRegex.test(member.memberEmail))
      return { text: '올바른 이메일 형식을 입력해주세요.', isError: true };
    if (mailAuth === 0)
      return { text: '인증 이메일을 전송해주세요.', isError: true };
    if (mailAuth === 2) {
      return {
        text: `인증번호를 입력하세요. (남은 시간: ${showTime()})`,
        isError: true,
      };
    }
    if (mailAuth === 3)
      return { text: '이메일 인증이 완료되었습니다.', isError: false };
    return { text: '\u00A0', isError: false };
  };

  // 💡 길이 제한 메시지 추가 (하이픈 포함된 길이 검사)
  const getStoreOwnerNoMessage = () => {
    if (!member.storeOwnerNo.trim())
      return {
        text: isSubmitted ? '사업자번호를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (member.storeOwnerNo.length < 12)
      return { text: '사업자번호 10자리를 모두 입력해주세요.', isError: true };
    if (checkStoreOwnerNo !== 2)
      return { text: '사업자번호 중복 확인을 눌러주세요.', isError: true };
    return { text: '가입 가능한 사업자 번호입니다.', isError: false };
  };

  const getPhoneMessage = () => {
    if (!member.memberPhone.trim())
      return {
        text: isSubmitted ? '휴대폰 번호를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (member.memberPhone.length < 13)
      return { text: '연락처 11자리를 모두 입력해주세요.', isError: true };
    return { text: '\u00A0', isError: false };
  };

  const getStoreNameMessage = () => {
    if (!member.storeName.trim())
      return {
        text: isSubmitted ? '상호명을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    return { text: '\u00A0', isError: false };
  };

  const getMemberNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? '대표자성명을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    return { text: '\u00A0', isError: false };
  };

  const getOpeningDateMessage = () => {
    if (!member.openingDate.trim())
      return {
        text: isSubmitted ? '개업일자를 선택하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    return { text: '\u00A0', isError: false };
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
        icon: 'warning',
        text: '입력하신 정보를 다시 확인해주세요.',
      });
      return;
    }

    // 상태에 이미 하이픈이 포함되어 있으므로 그대로 전송됩니다.
    const submitData = {
      ...member,
      memberGrade: 2,
    };

    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/member/signupManager`,
        submitData,
      )
      .then((res) => {
        Swal.fire({
          icon: 'success',
          text: '사업자 회원가입이 완료되었습니다!',
        }).then(() => {
          navigate('/login');
        });
      })
      .catch((err) => {
        console.error('회원가입 에러:', err);
        Swal.fire({
          icon: 'error',
          text: '회원가입 처리 중 오류가 발생했습니다.',
        });
      });
  };

  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setMember({ ...member, openingDate: formattedDate });
    setShowCalendar(false);
  };

  return (
    <div className={styles.signupPage}>
      <h1
        className={styles.mainLogo}
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        GreenCarry
      </h1>

      <div className={styles.card}>
        <h1 className={styles.title}>사업자 회원가입</h1>

        <form className={styles.form} onSubmit={joinSubmit}>
          {/* 아이디 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>아이디</label>
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
                className={`${styles.statusMessage} ${idStatus.isError ? styles.errorMessage : ''}`}
                style={!idStatus.isError ? { color: '#3a8a56' } : {}}
              >
                {idStatus.text}
              </p>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>비밀번호</label>
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
                className={`${styles.statusMessage} ${pwStatus.isError ? styles.errorMessage : ''}`}
                style={!pwStatus.isError ? { color: '#3a8a56' } : {}}
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
                className={`${styles.statusMessage} ${pwReStatus.isError ? styles.errorMessage : ''}`}
                style={!pwReStatus.isError ? { color: '#3a8a56' } : {}}
              >
                {pwReStatus.text}
              </p>
            </div>
          </div>

          {/* 이메일 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이메일</label>
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
                  disabled={mailAuth === 1 || mailAuth === 3}
                >
                  {mailAuth === 0 ? '인증 메일 전송' : '재전송'}
                </button>
              </div>

              <div className={`${styles.inputAreaInner} ${styles.mt10}`}>
                <input
                  type="text"
                  className={styles.inputUnderline}
                  placeholder="인증번호"
                  value={mailAuthInput}
                  onChange={(e) => {
                    setMailAuthInput(e.target.value);
                  }}
                  disabled={mailAuth !== 2}
                />
                <button
                  type="button"
                  className={styles.buttonFilled}
                  onClick={handleVerifyMail}
                  disabled={mailAuth !== 2}
                >
                  인증번호 확인
                </button>
              </div>

              <p
                className={`${styles.statusMessage} ${emailStatus.isError ? styles.errorMessage : ''}`}
                style={
                  !emailStatus.isError ? { color: 'var(--color-brand)' } : {}
                }
              >
                {emailStatus.text}
              </p>
            </div>
          </div>

          {/* 연락처 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>휴대폰 번호</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="memberPhone"
                value={member.memberPhone}
                onChange={inputMember}
                className={styles.inputUnderline}
                placeholder="숫자만 입력하세요"
              />
              <p
                className={`${styles.statusMessage} ${phoneStatus.isError ? styles.errorMessage : ''}`}
              >
                {phoneStatus.text}
              </p>
            </div>
          </div>

          {/* 사업자 번호 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>사업자 번호</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                <input
                  type="text"
                  name="storeOwnerNo"
                  value={member.storeOwnerNo}
                  onChange={inputMember}
                  className={styles.inputUnderline}
                  placeholder="숫자만 입력하세요"
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
                className={`${styles.statusMessage} ${storeOwnerNoStatus.isError ? styles.errorMessage : ''}`}
                style={!storeOwnerNoStatus.isError ? { color: '#3a8a56' } : {}}
              >
                {storeOwnerNoStatus.text}
              </p>
            </div>
          </div>

          {/* 상호명 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>상호명</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="storeName"
                value={member.storeName}
                onChange={inputMember}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${storeNameStatus.isError ? styles.errorMessage : ''}`}
              >
                {storeNameStatus.text}
              </p>
            </div>
          </div>

          {/* 대표자성명 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>대표자성명</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="memberName"
                value={member.memberName}
                onChange={inputMember}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${memberNameStatus.isError ? styles.errorMessage : ''}`}
              >
                {memberNameStatus.text}
              </p>
            </div>
          </div>

          {/* 개업일자 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>개업일자</label>
            <div className={styles.inputArea} id="openingDataArea">
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
                      calendarType="gregory"
                      value={
                        member.openingDate
                          ? new Date(member.openingDate)
                          : new Date()
                      }
                      formatDay={(locale, date) =>
                        date.toLocaleString('en', { day: 'numeric' })
                      }
                    />
                  </div>
                )}
              </div>

              <p
                className={`${styles.statusMessage} ${openingDateStatus.isError ? styles.errorMessage : ''}`}
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
