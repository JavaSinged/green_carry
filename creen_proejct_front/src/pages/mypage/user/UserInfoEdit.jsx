import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import api from "../../../utils/accessToken"; // axios 설정 파일
import "./UserInfoEdit.css";

export default function UserInfoEdit() {
  const { user } = useContext(AuthContext); // 로그인 세션 정보
  const [memberInfo, setMemberInfo] = useState(null); // DB에서 가져올 상세 정보
  const [loading, setLoading] = useState(true);

  // 🌟 컴포넌트 마운트 시 DB 조회
  useEffect(() => {
    if (user && user.memberId) {
      api
        .get(`/api/member/getMemberInfo`, user.memberId)
        .then((res) => {
          setMemberInfo(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("회원 정보 불러오기 실패:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const getGradeText = (grade) => {
    if (grade === 0) return "관리자";
    if (grade === 2) return "사업자 파트너";
    return "에코 히어로 (개인)";
  };

  if (loading)
    return <div className="loading-text">에코 데이터를 불러오는 중... 🌱</div>;

  return (
    <div className="edit-container">
      <div className="profile-card">
        <div className="profile-header">
          <AccountCircleOutlinedIcon className="profile-avatar" />
          {/* DB에서 가져온 실제 이름 혹은 세션 이름 */}
          <h2>{memberInfo?.memberName || user?.memberName} 님</h2>
          <span className="user-badge">
            {getGradeText(memberInfo?.memberGrade ?? user?.memberGrade)}
          </span>
        </div>

        <div className="info-list">
          <div className="info-item">
            <BadgeOutlinedIcon className="info-icon" />
            <div className="info-text">
              <label>아이디</label>
              <p>{memberInfo?.memberId}</p>
            </div>
          </div>

          <div className="info-item">
            <EmailOutlinedIcon className="info-icon" />
            <div className="info-text">
              <label>이메일</label>
              <p>{memberInfo?.memberEmail || "이메일 정보 없음"}</p>
            </div>
          </div>

          <div className="info-item">
            <HomeOutlinedIcon className="info-icon" />
            <div className="info-text">
              <label>연락처</label>
              <p>{memberInfo?.memberPhone || "전화번호 정보 없음"}</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="edit-btn"
            onClick={() => {
              /* 비밀번호 변경 페이지 이동 */
            }}
          >
            <LockResetIcon /> 비밀번호 변경
          </button>
          <button className="edit-btn">
            <HomeOutlinedIcon /> 주소지 관리
          </button>
          <button className="withdraw-btn">
            <ExitToAppIcon /> 회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
