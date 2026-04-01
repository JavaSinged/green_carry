import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ requireAdmin, requireManager, requireUser }) => {
  const { isLogin, user, isLoading } = useContext(AuthContext);

  // 1. 정보를 가져오는 아주 짧은 찰나에는 화면을 그리지 않음 (번쩍임 방지)
  if (isLoading) {
    return null;
  }

  // 2. 아예 로그인을 안 한 사람이 주소를 치고 들어왔을 때
  if (!isLogin || !user) {
    Swal.fire({
      icon: "warning",
      title: "로그인 필요",
      text: "로그인 후 이용할 수 있는 페이지입니다.",
    });
    return <Navigate to="/login" replace />;
  }

  // 🌟 3. 로컬스토리지나 DB에서 꺼내온 등급을 '무조건' 숫자로 강제 변환
  // 값이 없으면 에러를 뱉지 않고 -1(알 수 없음)로 처리해서 무조건 차단!
  const grade =
    user?.memberGrade !== undefined && user?.memberGrade !== null
      ? Number(user.memberGrade)
      : -1;

  // 🛠️ [디버깅용] 개발자 도구 콘솔(F12)에서 이걸 꼭 확인해보세요!
  console.log(
    `[문지기 검사] 현재 접속자 등급: ${grade} | 필요 권한 -> User: ${!!requireUser}, Manager: ${!!requireManager}, Admin: ${!!requireAdmin}`,
  );

  // 4. 권한별 강제 접속(URL 직접 입력) 차단
  if (requireAdmin && grade !== 0) {
    Swal.fire({
      icon: "error",
      title: "접근 불가",
      text: "관리자만 접근할 수 있는 영역입니다.",
    });
    return <Navigate to="/" replace />; // 쫓아내기
  }

  if (requireManager && grade !== 2) {
    Swal.fire({
      icon: "error",
      title: "접근 불가",
      text: "사업자 파트너 전용 영역입니다.",
    });
    return <Navigate to="/" replace />; // 쫓아내기
  }

  if (requireUser && grade !== 1) {
    Swal.fire({
      icon: "error",
      title: "접근 불가",
      text: "개인 이용자만 접근할 수 있습니다.",
    });
    return <Navigate to="/" replace />; // 쫓아내기
  }

  // 5. 모든 검문을 통과한 진짜 권한자만 입장!
  return <Outlet />;
};

export default ProtectedRoute;
