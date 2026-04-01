import styles from "./UserInfoEdit.module.css";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Collapse from '@mui/material/Collapse';
import HomeIcon from '@mui/icons-material/Home';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserInfoEdit() {
  const navigate = useNavigate();
  const [openPwSet, setopenPwSet] = useState(false);
  const [openAddSet, setopenAddSet] = useState(false);
  const togglePwSet = () => setopenPwSet(!openPwSet);
  const toggleAddSet = () => setopenAddSet(!openAddSet);
  // 상태값: 처음엔 가려져야 하니 false
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [pwData, setPwData] = useState({
    currentPw: "",
    newPw: "",
    confirmPw: ""
  });
  const [addressData, setAddressDate] = useState({
    zipCode: "",
    address: "",
    detailAddress: ""
  });
  const userInfo = {
    email: "aaa@gmail.com",
    name: "김이름",
    phoneNumber: "010-0000-0000"
  };
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressDate({ ...addressData, [name]: value });
  }
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwData({ ...pwData, [name]: value });
  }
  const handleDeleteClick = () => {
    const isConfirmed = window.confirm("정말로 탈퇴하시겠습니까? 데이터는 복구할 수 없습니다 ㅜㅜ");
    if (isConfirmed) {
      navigate("/nooo");
    }
  };

  return (
    <div className={styles.right}>
      <section className={styles.right_main}>
        <div className={styles.icon_content}>
          <div className={styles.icon}>
            <AccountCircleSharpIcon />
          </div>
          <div className={styles.dashboard}>
            <p className={styles.dashboard_email}>{userInfo.email}</p>
            <p className={styles.dashboard_name}>{userInfo.name}</p>
            <p className={styles.dashboard_phoneNumber}>{userInfo.phoneNumber}</p>
          </div>
        </div>
        <div className={styles.set_icon}><BorderColorIcon /></div>
      </section>

      <section className={styles.mini_box}>
        {/*비밀번호 변경 칸*/}
        <div className={styles.Wrapper}>
          <div className={styles.pwSet} onClick={togglePwSet}>
            <p>비밀번호 변경</p>
            <div className={styles.pw_icon}>
              {openPwSet ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openPwSet} timeout="auto" unmountOnExit>
            <div className={styles.pw_content_box}>
              <div className={styles.pw_form_container}>
                {/* 현재 비밀번호 */}
                <div className={styles.pw_input_row}>
                  <label>현재 비밀번호</label>
                  <div className={styles.input_wrapper}>
                    <input
                      //입력창
                      type={showCurrentPw ? "text" : "password"}
                      name="currentPw"
                      value={pwData.currentPw}
                      onChange={handlePwChange}
                      placeholder="현재 비밀번호 입력"
                    />
                    <div className={styles.eye_icon}
                      //아이콘
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      {showCurrentPw ? <Visibility /> : <VisibilityOff />}
                    </div>
                  </div>
                </div>

                {/* 새 비밀번호 */}
                <div className={styles.pw_input_row}>
                  <label>새 비밀번호</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type={showNewPw ? "text" : "password"}
                      name="newPw"
                      value={pwData.newPw}
                      onChange={handlePwChange}
                      placeholder="새 비밀번호 입력"
                    />
                    <div className={styles.eye_icon} onClick={() => setShowNewPw(!showNewPw)}>
                      {showNewPw ? <Visibility /> : <VisibilityOff />}
                    </div>
                  </div>
                </div>

                {/* 새 비밀번호 확인 */}
                <div className={styles.pw_input_row}>
                  <label>새 비밀번호 확인</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      name="confirmPw"
                      value={pwData.confirmPw}
                      onChange={handlePwChange}
                      placeholder="새 비밀번호 재입력"
                    />
                    <div className={styles.eye_icon} onClick={() => setShowConfirmPw(!showConfirmPw)}>
                      {showConfirmPw ? <Visibility /> : <VisibilityOff />}
                    </div>
                  </div>
                </div>
                <div className={styles.pw_input_row}>
                  <label></label>
                  <button className={styles.submit_btn}>
                    변경하기
                  </button>
                </div>
              </div>
            </div>
          </Collapse>
        </div>

        {/*주소지 칸*/}
        <div className={styles.Wrapper}>
          <div className={styles.addSet} onClick={toggleAddSet}>
            <p>주소지 변경</p>
            <div className={styles.add_icon}>
              {openAddSet ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openAddSet} timeout="auto" unmountOnExit>
            <div className={styles.add_content_box}>
              <div className={styles.pw_form_container}> {/* 클래스 재활용! */}

                {/* 1. 우편번호 & 주소 찾기 버튼 */}
                <div className={styles.pw_input_row}>
                  <label>우편번호</label>
                  {/* 우편번호 입력창은 짧아야 하므로 wrapper와 button을 나란히 배치 */}
                  <div className={styles.zip_code_wrapper}>
                    <div className={styles.input_wrapper}>
                      <input
                        type="text"
                        name="zipCode"
                        value={addressData.zipCode}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <button className={styles.find_address_btn}>주소 찾기</button>
                  </div>
                </div>

                {/* 2. 주소 */}
                <div className={styles.pw_input_row}>
                  <label>주소</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type="text"
                      name="address"
                      value={addressData.address}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                {/* 3. 상세 주소 */}
                <div className={styles.pw_input_row}>
                  <label>상세 주소</label>
                  <div className={styles.input_wrapper}>
                    <input
                      type="text"
                      name="detailAddress"
                      value={addressData.detailAddress}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                {/* 4. 주소 추가 버튼 */}
                <div className={styles.pw_input_row}>
                  <label></label>
                  <button className={styles.submit_btn}>주소 추가</button>
                </div>

              </div>

              {/* 5. 현재 주소지 표시 영역 */}
              <div className={styles.current_address_section}>
                <p className={styles.current_address_title}>현재 주소지</p>
                <div className={styles.current_address_box}>
                  <HomeIcon className={styles.home_icon} />
                  <div className={styles.address_info}>
                    <div className={styles.address_tag_row}>
                      <span className={styles.address_name}>집</span>
                      <span className={styles.address_tag}>현재 주소</span>
                    </div>
                    <p className={styles.address_detail}>서울시 종로구 대왕빌딩 301</p>
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </section>
      <div className={styles.deleteSet}>
        <div className={styles.delete_btn} onClick={handleDeleteClick}>
          <span className={styles.text_hover}>정말 탈퇴하시겠어요? 😢</span>
          <span className={styles.text_default}>회원 탈퇴</span>
        </div>
      </div>
    </div>
  );
}
