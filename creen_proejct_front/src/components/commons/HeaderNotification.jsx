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

    const eventSource = new EventSource(
      `${backHost}/api/notification/subscribe?memberId=${memberId}`,
    );

    eventSource.onopen = () => {
      /* 연결 로그 */
    };
    eventSource.addEventListener("ping", () => {
      /* 핑 로그 */
    });

    eventSource.addEventListener("orderUpdate", async (event) => {
      try {
        const data = JSON.parse(event.data);

        // 포인트 동기화 (기존 로직 동일)
        if (data.message.includes("취소") || data.message.includes("완료")) {
          const token = localStorage.getItem("accessToken");
          const res = await axios.get(`${backHost}/member/point/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const latestPoint = res.data.point || res.data;
          localStorage.setItem("memberPoint", latestPoint);
          window.dispatchEvent(new Event("pointUpdated"));
        }

        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [
          {
            ...data,
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
      /* 에러 처리 */
    };

    return () => {
      eventSource.close();
    };
  }, [memberId, backHost]);

  // 개별 클릭 시
  const handleNotiClick = async (notiId, navUrl) => {
    try {
      if (notiId) {
        await axios.patch(`${backHost}/api/notification/read/${notiId}`);
      }
      setNotifications((prev) => prev.filter((n) => n.notiId !== notiId));
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      if (navUrl) navigate(navUrl);
      setIsOpen(false);
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  // 💡 [추가] 전부 지우기 클릭 시
  const handleClearAll = async () => {
    try {
      // 1. DB에 모두 읽음(Y) 처리 요청
      await axios.patch(`${backHost}/api/notification/read/all`, null, {
        params: { memberId },
      });
      // 2. 로컬 화면 상태 싹 비우기
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false); // 창 닫기 (선택 사항)
    } catch (err) {
      console.error("전부 지우기 실패:", err);
    }
  };

  // 💡 [수정] 종 아이콘 클릭 시 빨간 배지 초기화
  const handleIconClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // 드롭다운을 열 때만 숫자 0으로 초기화
      setUnreadCount(0);
    }
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

      {unreadCount > 0 && (
        <span className={styles.noti_badge}>{unreadCount}</span>
      )}

      {isOpen && (
        <div className={styles.noti_dropdown}>
          {/* 💡 [추가] 타이틀과 전부 지우기 버튼을 나란히 배치 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 15px",
              borderBottom: "1px solid #eee",
            }}
          >
            <span
              className={styles.noti_header}
              style={{ borderBottom: "none", padding: 0 }}
            >
              최근 알림
            </span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  fontSize: "12px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                전부 지우기
              </button>
            )}
          </div>

          <div className={styles.noti_list}>
            {notifications.length > 0 ? (
              notifications.map((noti) => (
                <div
                  key={noti.notiId || Math.random()}
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
