import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "./EcoNight.css";

const EcoNight = () => {
  const [isActive, setIsActive] = useState(false);
  const [isFullyDark, setIsFullyDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponPosition, setCouponPosition] = useState({
    top: "50%",
    left: "50%",
  });

  // 🌟 손전등 크기 상태 (평소 135px -> 찾았을 때 350px로 확장)
  const [flashlightSize, setFlashlightSize] = useState("135px");
  const overlayRef = useRef(null);

  useEffect(() => {
    let keys = [];
    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === "night") {
        triggerBlackout();
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  const generateRandomPosition = () => {
    const randomTop = Math.floor(Math.random() * 60) + 20;
    const randomLeft = Math.floor(Math.random() * 60) + 20;
    setCouponPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  const triggerBlackout = () => {
    if (isActive) return;
    generateRandomPosition();
    setFlashlightSize("150px"); // 초기 크기
    setIsActive(true);
    setIsFullyDark(false);

    setTimeout(() => {
      setIsFullyDark(true);
      setFlashlightSize("350px"); // 🌟 쿠폰이 나오면 손전등 범위를 넓혀서 시야 확보!
    }, 1000);

    const handleMouseMove = (e) => {
      if (overlayRef.current) {
        overlayRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        overlayRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  };

  // 🌟 로컬 스토리지 포인트 업데이트 함수
  const updateLocalStoragePoints = (newPoint) => {
    // 1. 만약 'member' 객체 전체를 저장하고 있다면
    const storedMember = JSON.parse(localStorage.getItem("member"));
    if (storedMember) {
      storedMember.memberPoint = newPoint; // 포인트 필드 업데이트
      localStorage.setItem("member", JSON.stringify(storedMember));
    }

    // 2. 만약 별도의 'memberPoint' 키를 쓰고 있다면
    localStorage.setItem("memberPoint", newPoint);

    // 🌟 [중요] Navbar나 다른 컴포넌트가 바뀐 로컬 스토리지를 감지하게 하려면
    // 커스텀 이벤트를 쏴주는 게 베스트입니다.
    window.dispatchEvent(new Event("storage"));
  };

  const handleCouponClick = async () => {
    if (isSubmitting) return;

    const memberId = localStorage.getItem("memberId");

    if (!memberId) {
      Swal.fire({
        title: "로그인이 필요합니다!",
        icon: "warning",
        background: "#111",
        color: "#fff",
        confirmButtonColor: "#2ecc71",
      }).then(() => resetState());
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/Addpoint/${memberId}`,
        { event_code: "NIGHT_COUPON" },
      );

      // 🌟 서버에서 준 최신 포인트(res.data)를 로컬 스토리지에 동기화!
      updateLocalStoragePoints(res.data);

      Swal.fire({
        title: "올빼미족 인증!",
        html: `어둠 속에서 쿠폰을 발견하셨군요!<br/><b>현재 포인트: ${res.data}P</b>`,
        icon: "success",
        background: "#000",
        color: "#fff",
        confirmButtonColor: "#2ecc71",
      }).then(() => resetState());
    } catch (error) {
      console.error("포인트 지급 실패:", error);
      const errorMsg =
        error.response?.status === 409
          ? "이미 이 쿠폰의 보상을 받으셨습니다!"
          : "시스템 오류가 발생했습니다.";

      Swal.fire({
        title: "앗!",
        text: errorMsg,
        icon: "error",
        background: "#111",
        color: "#ff4757",
        confirmButtonColor: "#ff4757",
      }).then(() => resetState());
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setIsActive(false);
    setIsFullyDark(false);
    setFlashlightSize("150px");
  };

  if (!isActive) return null;

  return (
    <>
      <div
        className={`blackout-overlay ${isFullyDark ? "active" : ""}`}
        ref={overlayRef}
        style={{
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--flashlight-size": flashlightSize, // 🌟 CSS 변수로 크기 조절
        }}
      />

      {isFullyDark && (
        <div
          className="secret-coupon"
          onClick={handleCouponClick}
          style={couponPosition}
        >
          🍕 깜짝 쿠폰!
        </div>
      )}
    </>
  );
};

export default EcoNight;
