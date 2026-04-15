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

    const eventSource = new EventSource(
      `${backHost}/api/notification/subscribe?memberId=${memberId}`,
    );

    eventSource.addEventListener("orderUpdate", async (event) => {
      const data = JSON.parse(event.data);

      if (data.message.includes("취소") || data.message.includes("완료")) {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await axios.get(`${backHost}/member/point/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("서버 응답 데이터:", res.data);

          // 1. 최신 포인트 스토리지 저장
          // 백엔드 응답 필드가 point인지 memberPoint인지 확인 필요
          const latestPoint = res.data.point || res.data;
          localStorage.setItem("memberPoint", latestPoint);

          // 2. 전역 신호 발송 (마이페이지에서 이 신호를 받음)
          window.dispatchEvent(new Event("pointUpdated"));

          console.log("실시간 포인트 동기화 완료:", latestPoint);
        } catch (err) {
          console.error("포인트 갱신 중 에러 발생:", err);
        }
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
    });

    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
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
