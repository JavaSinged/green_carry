import styles from "./ManagerInfoEdit.module.css";
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Collapse from '@mui/material/Collapse';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OderInfoEdit() {
    const navigate = useNavigate();
    const [openPwSet, setopenPwSet] = useState(false);
    const togglePwSet = () => setopenPwSet(!openPwSet);
    // 상태값: 처음엔 가려져야 하니 false
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [pwData, setPwData] = useState({
        currentPw: "",
        newPw: "",
        confirmPw: ""
    });
    const oderInfo = {
        email: "aaa@gmail.com",
        name: "김이름",
        phoneNumber: "010-0000-0000"
    };
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
                        <p className={styles.dashboard_email}>{oderInfo.email}</p>
                        <p className={styles.dashboard_name}>{oderInfo.name}</p>
                        <p className={styles.dashboard_phoneNumber}>{oderInfo.phoneNumber}</p>
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

