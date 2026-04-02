import React, { useContext, useEffect, useState, useRef } from "react";
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
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function UserInfoEdit() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const backHost = import.meta.env.VITE_BACKSERVER;

  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 프로필 수정용 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    memberName: "",
    memberPhone: "",
  });
  const [profileImg, setProfileImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const fileInputRef = useRef(null);

  // 아코디언 상태
  const [openPwSet, setopenPwSet] = useState(false);
  const [openAddSet, setopenAddSet] = useState(false);

  const togglePwSet = () => setopenPwSet(!openPwSet);
  const toggleAddSet = () => setopenAddSet(!openAddSet);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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

  useEffect(() => {
    if (user && user.memberId) {
      api
        .get(`/member/getMemberInfo`, { params: { memberId: user.memberId } })
        .then((res) => {
          setMemberInfo(res.data);
          setProfileData({
            memberName: res.data.memberName || "",
            memberPhone: res.data.memberPhone || "",
          });
          if (res.data.memberThumb) setPreviewImg(res.data.memberThumb);
          setLoading(false);
        })
        .catch((err) => {
          console.error("데이터 로드 실패:", err);
          setLoading(false);
        });
    }
  }, [user]);

  // 프로필 정보 변경 핸들러
  const handleProfileDataChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async () => {
    if (!profileData.memberName || !profileData.memberPhone) {
      return Swal.fire(
        "알림",
        "이름과 전화번호를 모두 입력해주세요.",
        "warning",
      );
    }

    const formData = new FormData();
    formData.append("memberId", user.memberId);
    formData.append("memberName", profileData.memberName);
    formData.append("memberPhone", profileData.memberPhone);
    if (profileImg) {
      formData.append("uploadFile", profileImg);
    }

    try {
      const response = await api.post("/member/updateProfile", formData);

      if (response.data !== "UPDATE_FAIL") {
        Swal.fire("성공", "기본 정보가 수정되었습니다.", "success");

        const serverPath = response.data;

        const finalPath =
          serverPath === "SUCCESS_NO_IMAGE" ? previewImg : serverPath;

        localStorage.setItem("memberThumb", finalPath);

        setUser({
          ...user,
          memberThumb: finalPath,
        });

        setPreviewImg(finalPath);
        setIsEditingProfile(false);
      }
    } catch (error) {
      Swal.fire("에러", "수정 중 오류 발생", "error");
    }
  };

  // 비밀번호 변경 핸들러
  const handlePwSubmit = async () => {
    const { currentPw, newPw, confirmPw } = pwData;
    if (!currentPw || !newPw || !confirmPw)
      return Swal.fire("알림", "모든 필드를 입력해주세요.", "warning");

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

    if (currentPw === newPw)
      return Swal.fire(
        "알림",
        "현재 비밀번호와 다른 새 비밀번호를 사용해주세요.",
        "info",
      );
    if (newPw !== confirmPw)
      return Swal.fire("오류", "새 비밀번호가 일치하지 않습니다.", "error");

    try {
      const response = await api.post("/member/updatePassword", {
        memberId: user.memberId,
        currentPw,
        newPw,
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
      <section
        className={`${styles.right_main} ${isEditingProfile ? styles.right_main_editing : styles.right_main_default}`}
      >
        <div
          className={`${styles.icon_content} ${isEditingProfile ? styles.icon_content_editing : styles.icon_content_default}`}
        >
          <div
            className={`${styles.icon_wrapper} ${isEditingProfile ? styles.icon_wrapper_editable : ""}`}
            onClick={() => isEditingProfile && fileInputRef.current.click()}
          >
            {previewImg ? (
              <img
                src={
                  previewImg.startsWith("blob:")
                    ? previewImg
                    : `${backHost}${previewImg}`
                }
                alt="profile"
                className={styles.profile_image}
              />
            ) : (
              <AccountCircleSharpIcon className={styles.icon_inside} />
            )}

            {isEditingProfile && (
              <div className={styles.camera_overlay}>
                <PhotoCameraIcon fontSize="small" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className={styles.hidden_input}
              onChange={handleImageChange}
            />
          </div>

          {/* 프로필 텍스트 영역 */}
          <div className={styles.dashboard}>
            <p className={styles.dashboard_email}>{memberInfo?.memberEmail}</p>

            {isEditingProfile ? (
              <div className={styles.edit_form_container}>
                <input
                  type="text"
                  name="memberName"
                  value={profileData.memberName}
                  onChange={handleProfileDataChange}
                  className={styles.edit_input}
                  placeholder="이름"
                />
                <input
                  type="text"
                  name="memberPhone"
                  value={profileData.memberPhone}
                  onChange={handleProfileDataChange}
                  className={styles.edit_input}
                  placeholder="전화번호"
                />
                <div className={styles.edit_btn_group}>
                  <button
                    onClick={handleProfileSubmit}
                    className={styles.save_btn}
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setPreviewImg(memberInfo?.memberThumb);
                    }}
                    className={styles.cancel_btn}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={styles.dashboard_name}>
                  {memberInfo?.memberName} 님
                </p>
                <p className={styles.dashboard_phoneNumber}>
                  {memberInfo?.memberPhone}
                </p>
              </div>
            )}
          </div>
        </div>

        {!isEditingProfile && (
          <div
            className={styles.set_icon}
            onClick={() => setIsEditingProfile(true)}
          >
            <BorderColorIcon />
          </div>
        )}
      </section>

      <section className={styles.mini_box}>
        {/* 비밀번호 변경 아코디언 */}
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

        {/* 주소지 변경 아코디언 */}
        <div className={styles.Wrapper}>
          <div className={styles.addSet} onClick={toggleAddSet}>
            <p>주소지 변경</p>
            <div className={styles.add_icon}>
              {openAddSet ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openAddSet} timeout="auto" unmountOnExit>
            <div className={styles.add_content_box}>
              <div className={styles.current_address_section}>
                <p className={styles.current_address_title}>현재 주소지</p>
                <div className={styles.current_address_box}>
                  <HomeIcon className={styles.home_icon} />
                  <div className={styles.address_info}>
                    <div className={styles.address_tag_row}>
                      <span className={styles.address_name}>기본 배송지</span>
                      <span className={styles.address_tag}>현재 주소</span>
                    </div>
                    <p className={styles.address_detail}>
                      {memberInfo?.memberAddress || "주소 정보 없음"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </section>

      {/* 회원 탈퇴 영역 */}
      <div className={styles.deleteSet}>
        <div className={styles.delete_btn} onClick={handleDeleteClick}>
          <span className={styles.text_hover}>정말 떠나시겠어요? 😢</span>
          <span className={styles.text_default}>회원 탈퇴</span>
        </div>
      </div>
    </div>
  );
}
