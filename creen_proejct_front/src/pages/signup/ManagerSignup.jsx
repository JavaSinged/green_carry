import React, { useState } from 'react';
import styles from './ManagerSignup.module.css';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const ManagerSignup = () => {
  const navigate = useNavigate();

  const [manager, setManager] = useState({
    managerId: '',
    managerPw: '',
    managerEmail: '',
    bizNo: '',
    bizName: '',
    ceoName: '',
    openDate: '',
  });
  const [managerPwRe, setManagerPwRe] = useState('');

  // 제출 버튼 클릭 여부 (이 값을 기준으로 빈 칸 에러 표시)
  const [isSubmitted, setIsSubmitted] = useState(false);

  // UI 흐름 제어용 State (백엔드 없이 가짜 상태 관리)
  const [checkId, setCheckId] = useState(0); // 0: 확인 전, 2: 사용 가능
  const [mailAuth, setMailAuth] = useState(0); // 0: 전송 전, 1: 전송 완료, 3: 인증 완료
  const [checkBiz, setCheckBiz] = useState(0); // 0: 확인 전, 2: 사용 가능

  // 정규식 모음
  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const bizNoRegex = /^\d{3}-\d{2}-\d{5}$/; // 000-00-00000 형식

  const inputManager = (e) => {
    const { name, value } = e.target;
    setManager({ ...manager, [name]: value });

    // 입력값이 바뀌면 관련 상태 초기화
    if (name === 'managerId') setCheckId(0);
    if (name === 'managerEmail') setMailAuth(0);
    if (name === 'bizNo') setCheckBiz(0);
  };

  // 💡 가짜 연동 로직 (UI 테스트용)
  const handleIdCheck = () => {
    if (!idRegex.test(manager.managerId)) {
      alert('아이디 형식을 먼저 맞춰주세요.');
      return;
    }
    alert('사용 가능한 아이디입니다! (UI 테스트)');
    setCheckId(2);
  };

  const handleSendMail = () => {
    if (!emailRegex.test(manager.managerEmail)) {
      alert('올바른 이메일 형식을 먼저 입력해주세요.');
      return;
    }
    alert('인증 메일이 전송되었습니다. (테스트용: 아무 번호나 입력하세요)');
    setMailAuth(1);
  };

  const handleVerifyMail = () => {
    if (mailAuth !== 1) {
      alert('먼저 인증 이메일 전송 버튼을 눌러주세요.');
      return;
    }
    alert('이메일 인증이 완료되었습니다! (UI 테스트)');
    setMailAuth(3);
  };

  const handleBizCheck = () => {
    if (!bizNoRegex.test(manager.bizNo)) {
      alert('사업자번호를 000-00-00000 형식으로 입력해주세요.');
      return;
    }
    alert('가입 가능한 사업자번호입니다! (UI 테스트)');
    setCheckBiz(2);
  };

  // 💡 실시간 상태 체크 함수 (빈 칸일 때는 isSubmitted가 true일 때만 에러로 취급)
  const getIdMessage = () => {
    if (!manager.managerId)
      return {
        text: isSubmitted ? '아이디를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!idRegex.test(manager.managerId))
      return { text: '영문, 숫자 조합 8자 이상 입력해주세요.', isError: true };
    if (checkId !== 2)
      return { text: '중복 확인 버튼을 눌러주세요.', isError: true };
    return { text: '사용 가능한 아이디입니다.', isError: false };
  };

  const getPwMessage = () => {
    if (!manager.managerPw)
      return {
        text: isSubmitted ? '비밀번호를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!pwRegex.test(manager.managerPw))
      return {
        text: '영문 대/소문자, 숫자, 특수기호 포함 10자 이상 입력해주세요.',
        isError: true,
      };
    return { text: '사용 가능한 비밀번호입니다.', isError: false };
  };

  const getPwReMessage = () => {
    if (!managerPwRe)
      return {
        text: isSubmitted ? '비밀번호 확인을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (manager.managerPw !== managerPwRe)
      return { text: '비밀번호와 일치하지 않습니다.', isError: true };
    return { text: '비밀번호와 일치합니다.', isError: false };
  };

  const getEmailMessage = () => {
    if (!manager.managerEmail)
      return {
        text: isSubmitted ? '이메일을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!emailRegex.test(manager.managerEmail))
      return { text: '올바른 이메일 형식을 입력해주세요.', isError: true };
    if (mailAuth === 0)
      return { text: '인증 이메일을 전송해주세요.', isError: true };
    if (mailAuth === 1)
      return { text: '인증번호를 입력하고 확인을 눌러주세요.', isError: true };
    return { text: '이메일 인증이 완료되었습니다.', isError: false };
  };

  const getBizNoMessage = () => {
    if (!manager.bizNo)
      return {
        text: isSubmitted ? '사업자번호를 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    if (!bizNoRegex.test(manager.bizNo))
      return { text: '000-00-00000 형식으로 입력해주세요.', isError: true };
    if (checkBiz !== 2)
      return { text: '사업자번호 중복 확인을 눌러주세요.', isError: true };
    return { text: '가입 가능한 사업자 번호입니다.', isError: false };
  };

  const getBizNameMessage = () => {
    if (!manager.bizName.trim())
      return {
        text: isSubmitted ? '상호명을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    return { text: '\u00A0', isError: false };
  };

  const getCeoNameMessage = () => {
    if (!manager.ceoName.trim())
      return {
        text: isSubmitted ? '대표자성명을 입력하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    return { text: '\u00A0', isError: false };
  };

  const getOpenDateMessage = () => {
    if (!manager.openDate.trim())
      return {
        text: isSubmitted ? '개업일자를 선택하세요.' : '\u00A0',
        isError: isSubmitted,
      };
    return { text: '\u00A0', isError: false };
  };

  // 현재 입력 상태에 따른 메세지 변수 세팅
  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const bizNoStatus = getBizNoMessage();
  const bizNameStatus = getBizNameMessage();
  const ceoNameStatus = getCeoNameMessage();
  const openDateStatus = getOpenDateMessage();

  const joinSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true); // 제출 버튼을 눌렀음을 상태로 저장 (이후부터 빈 칸에 에러 메시지 뜸)

    // 빈 칸이 있는지 직접 체크 (isSubmitted 렌더링 반영 전 즉각적인 검사를 위함)
    const hasEmpty =
      !manager.managerId ||
      !manager.managerPw ||
      !managerPwRe ||
      !manager.managerEmail ||
      !manager.bizNo ||
      !manager.bizName.trim() ||
      !manager.ceoName.trim() ||
      !manager.openDate.trim();

    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      bizNoStatus.isError ||
      bizNameStatus.isError ||
      ceoNameStatus.isError ||
      openDateStatus.isError
    ) {
      alert('입력하신 정보를 다시 확인해주세요.');
      return;
    }

    console.log('사업자 가입 진행 데이터:', manager);
    alert('사업자 회원가입이 완료되었습니다! (UI 테스트)');
    navigate('/member/login');
  };

  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setManager({ ...manager, openDate: formattedDate });
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
            <label className={styles.label}>아이디 *</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                <input
                  type="text"
                  name="managerId"
                  value={manager.managerId}
                  onChange={inputManager}
                  className={styles.inputUnderline}
                  placeholder="영문, 숫자 조합 8자 이상" /* 추가됨 */
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
                className={`${styles.statusMessage} ${idStatus.isError ? styles.errorMessage : styles.successMessage}`}
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
                name="managerPw"
                value={manager.managerPw}
                onChange={inputManager}
                className={styles.inputUnderline}
                placeholder="영문 대/소문자, 숫자, 특수기호 포함 10자 이상" /* 추가됨 */
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
                name="managerPwRe"
                value={managerPwRe}
                onChange={(e) => setManagerPwRe(e.target.value)}
                className={styles.inputUnderline}
                placeholder="비밀번호 재입력" /* 추가됨 */
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
            <label className={styles.label}>이메일 *</label>
            <div className={styles.inputArea}>
              <div className={styles.inputAreaInner}>
                <input
                  type="email"
                  name="managerEmail"
                  value={manager.managerEmail}
                  onChange={inputManager}
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
                className={`${styles.statusMessage} ${emailStatus.isError ? styles.errorMessage : ''}`}
                style={!emailStatus.isError ? { color: '#3a8a56' } : {}}
              >
                {emailStatus.text}
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
                  name="bizNo"
                  value={manager.bizNo}
                  onChange={inputManager}
                  className={styles.inputUnderline}
                  placeholder="000-00-00000"
                  readOnly={checkBiz === 2}
                />
                <button
                  type="button"
                  className={styles.buttonOutlined}
                  onClick={handleBizCheck}
                  disabled={checkBiz === 2}
                >
                  중복 확인
                </button>
              </div>
              <p
                className={`${styles.statusMessage} ${bizNoStatus.isError ? styles.errorMessage : ''}`}
                style={!bizNoStatus.isError ? { color: '#3a8a56' } : {}}
              >
                {bizNoStatus.text}
              </p>
            </div>
          </div>

          {/* 상호명 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>상호명 *</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="bizName"
                value={manager.bizName}
                onChange={inputManager}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${bizNameStatus.isError ? styles.errorMessage : ''}`}
              >
                {bizNameStatus.text}
              </p>
            </div>
          </div>

          {/* 대표자성명 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>대표자성명 *</label>
            <div className={styles.inputArea}>
              <input
                type="text"
                name="ceoName"
                value={manager.ceoName}
                onChange={inputManager}
                className={styles.inputUnderline}
              />
              <p
                className={`${styles.statusMessage} ${ceoNameStatus.isError ? styles.errorMessage : ''}`}
              >
                {ceoNameStatus.text}
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
                  name="openDate"
                  value={manager.openDate}
                  className={`${styles.inputUnderline}`}
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
                        manager.openDate
                          ? new Date(manager.openDate)
                          : new Date()
                      }
                      /* 달력 헤더/요일 폰트 스타일 등을 맞추기 위해 formatDay 등 유지 */
                    />
                  </div>
                )}
              </div>

              <p
                className={`${styles.statusMessage} ${openDateStatus.isError ? styles.errorMessage : ''}`}
              >
                {openDateStatus.text}
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
