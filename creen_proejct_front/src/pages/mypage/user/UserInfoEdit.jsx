import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../utils/accessToken";
import styles from "./UserInfoEdit.module.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// MUI Icons
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HomeIcon from "@mui/icons-material/Home";
import Collapse from "@mui/material/Collapse";

export default function UserInfoEdit() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 아코디언 상태
  const [openPwSet, setopenPwSet] = useState(false);
  const [openAddSet, setopenAddSet] = useState(false);

  // 아코디언 토글 함수
  const togglePwSet = () => setopenPwSet(!openPwSet);
  const toggleAddSet = () => setopenAddSet(!openAddSet);

  // 비밀번호 가시성 상태 (현재, 새 비밀번호, 확인 각각 관리)
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // 입력 데이터 상태
  const [pwData, setPwData] = useState({
    currentPw: "",
    newPw: "",
    confirmPw: "",
  });
  const [addressData, setAddressDate] = useState({
    zipCode: "",
    address: "",
    detailAddress: "",
  });

  // 회원 정보 불러오기
  useEffect(() => {
    if (user && user.memberId) {
      api
        .get(`/member/getMemberInfo`, {
          params: { memberId: user.memberId },
        })
        .then((res) => {
          setMemberInfo(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("데이터 로드 실패:", err);
          setLoading(false);
        });
    }
  }, [user]);

  // 비밀번호 변경 핸들러
  const handlePwSubmit = async () => {
    const { currentPw, newPw, confirmPw } = pwData;

    // 1. 빈 칸 체크
    if (!currentPw || !newPw || !confirmPw) {
      return Swal.fire("알림", "모든 필드를 입력해주세요.", "warning");
    }

    // 🌟 2. 강력한 비밀번호 정규표현식 (요청하신 조건 반영)
    // 규칙: 대문자(?=.*[A-Z]), 소문자(?=.*[a-z]), 숫자(?=.*\d), 특수문자(?=.*[@$!%*#?&]) 포함, 10자 이상{10,}
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/;

    if (!passwordRegex.test(newPw)) {
      return Swal.fire({
        icon: "warning",
        title: "비밀번호 보안 수준 미달",
        html: `비밀번호는 다음 조건을 모두 만족해야 합니다:<br/>
               <div style="text-align: left; margin-top: 10px; padding-left: 20px;">
                 - 최소 10자 이상<br/>
                 - 영어 대문자 및 소문자 포함<br/>
                 - 숫자 및 특수문자 포함
               </div>`,
      });
    }

    // 3. 이전 비밀번호와 동일 여부 체크
    if (currentPw === newPw) {
      return Swal.fire(
        "알림",
        "현재 비밀번호와 다른 새 비밀번호를 사용해주세요.",
        "info",
      );
    }

    // 4. 일치 여부 체크
    if (newPw !== confirmPw) {
      return Swal.fire("오류", "새 비밀번호가 일치하지 않습니다.", "error");
    }

    // --- 통과 시 API 호출 ---
    try {
      const response = await api.post("/member/updatePassword", {
        memberId: user.memberId,
        currentPw: currentPw,
        newPw: newPw,
      });

      if (response.data === "SUCCESS") {
        await Swal.fire(
          "성공",
          "비밀번호가 안전하게 변경되었습니다.",
          "success",
        );
        setPwData({ currentPw: "", newPw: "", confirmPw: "" });
        setopenPwSet(false);
      }
    } catch (error) {
      const msg =
        error.response?.data === "CURRENT_PASSWORD_MISMATCH"
          ? "현재 비밀번호가 올바르지 않습니다."
          : "서버 오류가 발생했습니다.";
      Swal.fire("에러", msg, "error");
    }
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwData({ ...pwData, [name]: value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressDate({ ...addressData, [name]: value });
  };

  const handleDeleteClick = () => {
    const isConfirmed = window.confirm(
      "정말로 탈퇴하시겠습니까? 데이터는 복구할 수 없습니다 ㅜㅜ",
    );
    if (isConfirmed) navigate("/nooo");
  };

  if (loading)
    return (
      <div className={styles.loading}>에코 데이터를 불러오는 중... 🌱</div>
    );

  return (
    <div className={styles.right}>
      <section className={styles.right_main}>
        <div className={styles.icon_content}>
          <div className={styles.icon}>
            <AccountCircleSharpIcon className={styles.icon_inside} />
          </div>
          <div className={styles.dashboard}>
            <p className={styles.dashboard_email}>{memberInfo?.memberEmail}</p>
            <p className={styles.dashboard_name}>{memberInfo?.memberName} 님</p>
            <p className={styles.dashboard_phoneNumber}>
              {memberInfo?.memberPhone}
            </p>
          </div>
        </div>
        <div className={styles.set_icon}>
          <BorderColorIcon />
        </div>
      </section>

      <section className={styles.mini_box}>
        {/* 비밀번호 변경 섹션 */}
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
                {/* 🌟 비밀번호 입력 필드들을 배열로 구성하여 렌더링 */}
                {[
                  {
                    label: "현재 비밀번호",
                    name: "currentPw",
                    state: showCurrentPw,
                    setState: setShowCurrentPw,
                  },
                  {
                    label: "새 비밀번호",
                    name: "newPw",
                    state: showNewPw,
                    setState: setShowNewPw,
                  },
                  {
                    label: "새 비밀번호 확인",
                    name: "confirmPw",
                    state: showConfirmPw,
                    setState: setShowConfirmPw,
                  },
                ].map((item) => (
                  <div className={styles.pw_input_row} key={item.name}>
                    <label>{item.label}</label>
                    <div className={styles.input_wrapper}>
                      <input
                        type={item.state ? "text" : "password"}
                        name={item.name}
                        value={pwData[item.name]}
                        onChange={handlePwChange}
                        placeholder={`${item.label} 입력`}
                      />
                      <div
                        className={styles.eye_icon}
                        onClick={() => item.setState(!item.state)}
                      >
                        {item.state ? <Visibility /> : <VisibilityOff />}
                      </div>
                    </div>
                  </div>
                ))}

                <div className={styles.pw_input_row}>
                  <label></label>
                  <button
                    className={styles.submit_btn}
                    onClick={handlePwSubmit}
                  >
                    변경하기
                  </button>
                </div>
              </div>
            </div>
          </Collapse>
        </div>

        {/* 주소지 변경 섹션 */}
        <div className={styles.Wrapper}>
          <div className={styles.addSet} onClick={toggleAddSet}>
            <p>주소지 변경</p>
            <div className={styles.add_icon}>
              {openAddSet ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openAddSet} timeout="auto" unmountOnExit>
            <div className={styles.add_content_box}>
              {/* 여기에 주소지 입력 폼을 추가할 수 있습니다 */}
              <div className={styles.current_address_section}>
                <p className={styles.address_detail}>
                  {memberInfo?.memberAddress || "주소 정보 없음"}
                </p>
              </div>
            </div>
          </Collapse>
        </div>
      </section>

      <div className={styles.deleteSet}>
        <div className={styles.delete_btn} onClick={handleDeleteClick}>
          회원 탈퇴
        </div>
      </div>
    </div>
  );
}
