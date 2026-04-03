import styles from "./UserDelAccount.module.css";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import WarningIcon from '@mui/icons-material/Warning';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserDelAccount = () => {
    const { user, logout } = useContext(AuthContext); // 현재 로그인한 유저 정보
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [password, setPassword] = useState(""); // 입력한 비밀번호
    const [isAgreed, setIsAgreed] = useState(false); // 마지막 체크박스 동의

    const handleDeleteAccount = async () => {
        // 체크박스 동의 여부
        if (!isAgreed) {
            alert("안내 사항을 모두 확인하셨으면 탈퇴에 동의해 주세요.");
            return;
        }
        // 비밀번호 입력 여부
        if (!password) {
            alert("비밀번호를 입력해 주세요.");
            return;
        }
        //서버로 탈퇴 요청 보내기(비밀번호 검증 및 DB 삭제)
        try {
            const token = localStorage.getItem("accessToken");

            const response = await axios.post(
                `${import.meta.env.VITE_BACKSERVER}/member/delete`,
                { password: password },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            //탈퇴 성공시

            alert("그동안 이용해 주셔서 감사합니다. 회원 탈퇴가 완료되었습니다.");
            logout()
            //비밀번호 틀렸을 시
        } catch (err) {
            console.log(err)("탈퇴 요청 중 에러 발생:", err);
            alert("서버와 통신 중 문제가 발생했습니다.");
        }
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }
    useEffect(() => {

    })
    return (
        <div className={styles.wrapper}>
            <div className={styles.main_container}>
                <section>
                    <div className={styles.main_text}>
                        <h1>회원 탈퇴</h1>
                        <h2>탈퇴를 진행하시겠습니까?</h2>
                        <p>회원님은 <span>2023년 3월</span>부터 저희와 함께했어요</p>
                    </div>
                </section>
                <section>
                    <div className={styles.big_text}>
                        <div className={styles.box}>
                            <h2 className={styles.box_text}>나의 탄소 절감량</h2>
                            <h2 className={styles.box_value}>1,000g</h2>
                        </div>
                        <div className={styles.box}>
                            <h2 className={styles.box_text}>보유 포인트</h2>
                            <h2 className={styles.box_value}>6,847p</h2>
                        </div>
                    </div>
                </section>
                <section>
                    <div className={styles.gray_box}>
                        <div className={styles.warning_icon}>
                            <WarningIcon />
                            <span>탈퇴 전 꼭 확인해 주세요!</span>
                        </div>
                        <div className={styles.gray_box_text}>
                            <li>탈퇴 시 회원님의 모든 정보는 삭제되며 복구할 수 없습니다.</li>
                            <li>보유 중인 쿠폰 및 포인트는 모두 소명됩니다.</li>
                            <li>진행 중인 주문이 있는 경우 탈퇴가 제한될 수 있습니다.</li>
                        </div>
                        <div className={styles.bold_text}>
                            <p>조금만 더 이용해보시는 건 어떠세요? 더 나은 서비스로 보답하겠습니다.</p>
                        </div>
                    </div>
                    <section>
                        <div className={styles.reasonSection}>
                            <p>탈퇴 결정에 배달 서비스 불만이 미친 영향이 있나요? (선택)</p>
                            <div className={styles.reason_check}>
                                <label>
                                    <input type="checkbox" /> 배송 품질(파손, 누락) 불만
                                </label>
                                <label>
                                    <input type="checkbox" /> 느린 배송 / 예정 시간 초과
                                </label>
                                <label>
                                    <input type="checkbox" /> 오배송 및 주소 오인
                                </label>
                                <label>
                                    <input type="checkbox" /> 배달 관련 불만 없음
                                </label>
                            </div>
                        </div>
                        <section className={styles.text_input}>
                            <div className={styles.reason_input}>
                                <p>구체적인 사유를 작성해 주세요 <span>(선택)</span></p>
                                <input type="text" autoComplete="off" />
                            </div>
                            <div className={styles.reason_pwInput}>
                                <p>비밀번호</p>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호를 입력하세요"
                                    className={styles.pwd_input}
                                />
                                <div className={styles.eye_icon} onClick={togglePassword}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </div>
                            </div>
                        </section>
                        <div className={styles.last_check_box}>
                            <label>
                                <input type="checkbox" />
                                <p>안내 사항을 모두 확인 하였으며 탈퇴에 동의 합니다.</p>
                            </label>
                        </div>
                    </section>
                </section>
            </div>
            <div className={styles.two_btn}>
                <div className={styles.cancel_btn}>
                    <p>취소</p>
                </div>
                <div className={styles.goodbye_btn}>
                    <p>회원 탈퇴</p>
                </div>
            </div>
        </div>
    );
};

export default UserDelAccount;