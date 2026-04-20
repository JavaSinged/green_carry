import React, { useState, useEffect, useRef } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import styles from "./HeaderNotification.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HeaderNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const backHost = import.meta.env.VITE_BACKSERVER;
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const saved = localStorage.getItem("memberId");
    if (saved) setMemberId(saved);
  }, []);

  useEffect(() => {
    if (!memberId) return;

    console.log(
      `%c🚀 SSE 연결 시도 (memberId: ${memberId})`,
      "color: #1e88e5; font-weight: bold;",
    );

    const eventSource = new EventSource(
      `${backHost}/api/notification/subscribe?memberId=${memberId}`,
    );

    // 1. 연결 성공 확인
    eventSource.onopen = () => {
      console.log(
        "%c✅ SSE 연결이 성공적으로 수립되었습니다.",
        "color: #2e7d32; font-weight: bold;",
      );
    };

    // 2. 메시지 수신 (기존 eventSource.addEventListener("orderUpdate", ...))
    eventSource.addEventListener("orderUpdate", async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("%c📩 알림 도착:", "color: #fb8c00;", data);

        if (data.message.includes("취소") || data.message.includes("완료")) {
          // 포인트 동기화 로직 (기존과 동일)
          const token = localStorage.getItem("accessToken");
          const res = await axios.get(`${backHost}/member/point/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const latestPoint = res.data.point || res.data;
          localStorage.setItem("memberPoint", latestPoint);
          window.dispatchEvent(new Event("pointUpdated"));
          console.log("💰 포인트 동기화 완료:", latestPoint);
        }

        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [
          {
            message: data.message,
            navUrl: data.navUrl,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ]);
      } catch (err) {
        console.error("데이터 파싱 또는 포인트 업데이트 중 에러:", err);
      }
    });

    // 🚨 3. 에러 핸들링 (재연결을 위해 close() 호출 금지!)
    eventSource.onerror = (e) => {
      if (eventSource.readyState === EventSource.CONNECTING) {
        console.warn("⚠️ SSE 연결이 끊겼습니다. 재연결을 시도합니다...");
      } else if (eventSource.readyState === EventSource.CLOSED) {
        console.error("❌ SSE 연결이 완전히 닫혔습니다.");
      } else {
        console.error("🚨 SSE 알 수 없는 에러 발생:", e);
      }
    };

    return () => {
      console.log("%c🧹 컴포넌트 언마운트: SSE 연결 종료", "color: #757575;");
      eventSource.close();
    };
  }, [memberId, backHost]);

  const handleNotiClick = (navUrl) => {
    if (navUrl) {
      navigate(navUrl); // 해당 페이지로 이동
      setIsOpen(false); // 드롭다운 닫기
    }
  };

  const handleIconClick = () => {
    setUnreadCount(0);
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.noti_icon_wrap} ref={dropdownRef}>
      <NotificationsNoneIcon
        className={styles.bell_icon}
        onClick={handleIconClick}
      />

      {/* 빨간 배지 */}
      {unreadCount > 0 && (
        <span className={styles.noti_badge}>{unreadCount}</span>
      )}

      {/* 알림 드롭다운 창 */}
      {isOpen && (
        <div className={styles.noti_dropdown}>
          <span className={styles.noti_header}>최근 알림</span>
          <div className={styles.noti_list}>
            {notifications.length > 0 ? (
              notifications.map((noti, idx) => (
                <div
                  key={idx}
                  className={styles.noti_item}
                  onClick={() => handleNotiClick(noti.navUrl)}
                  style={{ cursor: "pointer" }}
                >
                  <p className={styles.noti_msg}>{noti.message}</p>
                  <span className={styles.noti_time}>{noti.time}</span>
                </div>
              ))
            ) : (
              <p className={styles.empty_msg}>새로운 알림이 없습니다. 🌿</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNotification;
