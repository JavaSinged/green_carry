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

    // 1. DB에서 기존 알림 가져오기
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${backHost}/api/notification/list`, {
          params: { memberId },
        });
        setNotifications(res.data);
        setUnreadCount(res.data.length);
      } catch (err) {
        console.error("알림 목록 로딩 실패:", err);
      }
    };

    fetchUnread();

    // 2. SSE 연결 시도
    console.log(
      `%c🚀 SSE 연결 시도 (memberId: ${memberId})`,
      "color: #1e88e5; font-weight: bold;",
    );
    const eventSource = new EventSource(
      `${backHost}/api/notification/subscribe?memberId=${memberId}`,
    );

    eventSource.onopen = () => {
      console.log("%c✅ SSE 연결 성공", "color: #2e7d32; font-weight: bold;");
    };

    eventSource.addEventListener("ping", () => {
      console.log(
        "%c📡 Heartbeat 수신 중...",
        "color: #9e9e9e; font-style: italic;",
      );
    });

    // 실시간 알림 수신
    eventSource.addEventListener("orderUpdate", async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("%c📩 새 알림 도착:", "color: #fb8c00;", data);

        // 포인트 동기화 로직 (필요 시)
        if (data.message.includes("취소") || data.message.includes("완료")) {
          const token = localStorage.getItem("accessToken");
          const res = await axios.get(`${backHost}/member/point/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const latestPoint = res.data.point || res.data;
          localStorage.setItem("memberPoint", latestPoint);
          window.dispatchEvent(new Event("pointUpdated"));
        }

        // 상태 업데이트
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [
          {
            ...data, // 백엔드에서 보낸 notiId, message, navUrl 포함
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev,
        ]);
      } catch (err) {
        console.error("데이터 파싱 에러:", err);
      }
    });

    eventSource.onerror = (e) => {
      if (eventSource.readyState === EventSource.CONNECTING) {
        console.warn("⚠️ SSE 재연결 시도 중...");
      } else {
        console.error("🚨 SSE 연결 에러");
      }
    };

    return () => {
      eventSource.close();
    };
  }, [memberId, backHost]);

  // 알림 클릭 시 처리 (notiId 추가)
  const handleNotiClick = async (notiId, navUrl) => {
    try {
      // 1. DB에 읽음 상태 반영 (ID가 있는 경우만)
      if (notiId) {
        await axios.patch(`${backHost}/api/notification/read/${notiId}`);
      }

      // 2. 로컬 상태 반영
      setNotifications((prev) => prev.filter((n) => n.notiId !== notiId));
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      // 3. 페이지 이동
      if (navUrl) navigate(navUrl);
      setIsOpen(false);
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  const handleIconClick = () => {
    setIsOpen(!isOpen);
    // 선택 사항: 열 때 숫자를 초기화하고 싶다면 여기서 처리
  };

  // 외부 클릭 시 닫기
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

      {unreadCount > 0 && (
        <span className={styles.noti_badge}>{unreadCount}</span>
      )}

      {isOpen && (
        <div className={styles.noti_dropdown}>
          <span className={styles.noti_header}>최근 알림</span>
          <div className={styles.noti_list}>
            {notifications.length > 0 ? (
              notifications.map((noti) => (
                <div
                  key={noti.notiId || Math.random()} // PK인 notiId를 key로 사용
                  className={styles.noti_item}
                  onClick={() => handleNotiClick(noti.notiId, noti.navUrl)}
                  style={{ cursor: "pointer" }}
                >
                  <p className={styles.noti_msg}>{noti.message}</p>
                  <span className={styles.noti_time}>
                    {noti.time || noti.createdAt}
                  </span>
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
