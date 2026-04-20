import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "./EcoDrone.css";

const EcoDrone = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDropped, setIsDropped] = useState(false);

  const droneRef = useRef(null);
  const targetPos = useRef({ x: -100, y: 100 }); // 목표 지점 (마우스)
  const currentPos = useRef({ x: -100, y: 100 }); // 현재 드론 위치
  const requestRef = useRef();

  // 'drone' 타이핑 감지
  useEffect(() => {
    let keys = [];
    const secretWord = "drone";

    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === secretWord) {
        setIsActive(true);
        setIsDropped(false);
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 드론이 마우스 부드럽게 따라다니기 (Lerp 적용)
  useEffect(() => {
    if (!isActive || isDropped) return;

    const handleMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = Math.min(e.clientY, 900); //
    };
    window.addEventListener("mousemove", handleMouseMove);

    const update = () => {
      // 보간법(Lerp)으로 부드럽게 따라가기
      currentPos.current.x +=
        (targetPos.current.x - currentPos.current.x) * 0.05;
      currentPos.current.y +=
        (targetPos.current.y - currentPos.current.y) * 0.05;

      if (droneRef.current) {
        // 이동 방향에 따라 드론 본체 살짝 기울이기
        const tilt = (targetPos.current.x - currentPos.current.x) * 0.1;
        droneRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) rotate(${tilt}deg)`;
      }
      requestRef.current = requestAnimationFrame(update);
    };
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isDropped]);

  // 상자 투하 로직
  const handleDrop = () => {
    if (isDropped) return;
    setIsDropped(true); // 드론 멈춤, 상자 떨어짐 애니메이션 시작

    setTimeout(() => {
      Swal.fire({
        title: "시크릿 보급품 도착!",
        html: "숨겨진 포인트 1000P 지급!<br/><b style='color:#2e7d32; font-size: 20px; letter-spacing: 2px;'></b>",
        icon: "success",
        confirmButtonText: "받기(최초1회)",
        confirmButtonColor: "#2e7d32",
      }).then(() => {
        setIsActive(false); // 창 닫으면 드론 퇴근
      });
    }, 1200); // 상자가 바닥에 떨어지는 시간 대기
  };

  if (!isActive) return null;

  return (
    <div className="eco-drone-overlay">
      {/* 🌟 드론 본체 (클릭 시 이벤트 발생) */}
      <div ref={droneRef} className="eco-drone" onClick={handleDrop}>
        <span className="drone-icon">🚁</span>

        {/* 상자 (평소엔 드론에 매달려 있다가 isDropped 시 추락) */}
        <div className={`eco-box ${isDropped ? "drop" : ""}`}>
          <span className="parachute">🪂</span>
          📦
        </div>
      </div>
    </div>
  );
};

export default EcoDrone;
