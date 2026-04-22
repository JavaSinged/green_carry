import React, { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./UserProfile.module.css";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Collapse from "@mui/material/Collapse";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import axios from "axios";
import Pagination from "../../../components/commons/Pagination";

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [point, setPoint] = useState(() => {
    const savedPoint = localStorage.getItem("memberPoint");
    return savedPoint ? Number(savedPoint) : 0;
  });
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [communityPoint, setCommunityPoint] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [openEco, setOpenEco] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const pageGroupSize = 10;

  // 🌟 필터는 형님의 기존 로직(status >= 1) 그대로 유지!
  const filteredHistory = pointHistory.filter((item) => item.orderStatus >= 1);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = filteredHistory.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const getEcoGrade = (currentCarbon) => {
    if (currentCarbon < 1000) return { name: "꼬마 씨앗 🌰", next: 1000 };
    if (currentCarbon < 3000) return { name: "파릇파릇 새싹 🌱", next: 3000 };
    if (currentCarbon < 6600) return { name: "무럭무럭 묘목 🌿", next: 6600 };
    if (currentCarbon < 10000) return { name: "든든한 나무 🌳", next: 10000 };
    return { name: "울창한 숲 🌲", next: null };
  };

  const myGradeInfo = getEcoGrade(totalCarbon);
  const formattedCarbon =
    totalCarbon >= 100000
      ? (totalCarbon / 1000).toFixed(1) + "kg"
      : totalCarbon.toLocaleString() + "g";

  const fetchUserData = useCallback(async () => {
    if (!user?.memberId) return;
    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const historyRes = await axios.get(
        `${backHost}/member/point-history/${user.memberId}`,
        config,
      );
      setPointHistory(historyRes.data);
      const carbonRes = await axios.get(`${backHost}/member/total-carbon`, {
        params: { memberId: user.memberId },
        ...config,
      });
      setTotalCarbon(Math.floor(carbonRes.data.totalCarbonReduce * 1000));
      const commRes = await axios.get(`${backHost}/member/community-carbon`);
      setCommunityPoint(commRes.data);
    } catch (err) {
      console.error("데이터 동기화 실패", err);
    }
  }, [user?.memberId, backHost]);

  const toggleEco = () => setOpenEco(!openEco);
  const toggleHistory = () => {
    setOpenHistory(!openHistory);
    if (!openHistory) setCurrentPage(1);
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (user?.memberPoint !== undefined) setPoint(user.memberPoint);
  }, [user]);

  useEffect(() => {
    const targetPoint = 10000;
    const calculatedPercent = Math.min((totalCarbon / targetPoint) * 100, 100);
    const timer = setTimeout(() => setProgress(calculatedPercent), 100);
    return () => clearTimeout(timer);
  }, [totalCarbon]);

  return (
    <div className={styles.right}>
      {/* 상단 대시보드 (기존 유지) */}
      <div className={styles.user_grade}>
        <div className={styles.ecoGrade}>
          <div className={styles.grade_header}>
            <WorkspacePremiumIcon />
            <span className={styles.grade_title}>나의 에코 등급</span>
          </div>
          <div className={styles.grade_body}>
            <h2 className={styles.grade_name}>{myGradeInfo.name}</h2>
            <p className={styles.grade_subtitle}>
              {myGradeInfo.next
                ? `다음 레벨까지 ${(myGradeInfo.next - totalCarbon).toLocaleString()}g`
                : "🎉 최고 등급 달성!"}
            </p>
          </div>
        </div>
        <section className={styles.right_main}>
          <div className={styles.icon_content}>
            <div className={styles.icon}>
              <EnergySavingsLeafIcon />
            </div>
            <div className={styles.dashboard}>
              <p className={styles.dashboard_title}>나의 누적 탄소 절감량</p>
              <p className={styles.dashboard_value}>{formattedCarbon}</p>
              <p className={styles.dashbboard_subtitle}>나의 총 실천 기록</p>
            </div>
          </div>
          <div className={styles.icon_content}>
            <div className={styles.icon}>
              <Diversity1Icon />
            </div>
            <div className={styles.dashboard}>
              <p className={styles.dashboard_title}>커뮤니티가 절약한 탄소</p>
              <p className={styles.dashboard_value}>
                {communityPoint.toFixed(1)}kg
              </p>
              <p className={styles.dashbboard_subtitle}>CO2</p>
            </div>
          </div>
          <div className={styles.gauge_container}>
            <div className={styles.gauge_bg}>
              <div
                className={styles.gauge_fill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={styles.gauge_info}>
              <span>🌳 나무 {(totalCarbon / 6600).toFixed(2)} 그루 상당</span>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.right_sub}>
        <div className={styles.my_point}>
          <span>에코 포인트</span>
          <p>보유 포인트 : {point.toLocaleString()}P</p>
        </div>

        {/* 에코포인트 설명 (기존 유지) */}
        <div className={styles.collapse_wrapper}>
          <div className={styles.collapse_header} onClick={toggleEco}>
            <p>에코 포인트란?</p>
            <div className={styles.my_icon}>
              {openEco ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openEco} timeout="auto" unmountOnExit>
            <div className={styles.eco_content_box}>
              <p>
                에코 포인트는 친환경 배달을 선택할 때 적립되는 포인트입니다.
              </p>
              <p className={styles.eco_slogan}>
                🌱 작은 선택이 지구를 바꿉니다.
              </p>
            </div>
          </Collapse>
        </div>

        {/* 🌟 적립/사용 내역 (형님의 CSS 스타일 완벽 적용) */}
        <div className={styles.collapse_wrapper}>
          <div className={styles.collapse_header} onClick={toggleHistory}>
            <p>
              적립/사용 내역{" "}
              <span className={styles.history_sub}>최근 3개월 내역</span>
            </p>
            <div className={styles.hs_icon}>
              {openHistory ? (
                <KeyboardArrowDownIcon />
              ) : (
                <ArrowForwardIosIcon />
              )}
            </div>
          </div>
          <Collapse in={openHistory} timeout="auto" unmountOnExit>
            <div className={styles.history_list}>
              {currentHistoryItems.length > 0 ? (
                <>
                  {currentHistoryItems.map((item) => {
                    // 🌟 SQL 별칭 orderStatus 사용
                    const isCancelled = item.orderStatus === 9;
                    const isPending =
                      item.orderStatus >= 1 && item.orderStatus <= 5;
                    const hasUsed = item.usedPoint > 0;
                    const hasGet = item.getPoint > 0;

                    return (
                      <div
                        key={item.orderId}
                        className={`${styles.history_item} ${isCancelled ? styles.item_cancelled : ""}`}
                      >
                        <div className={styles.history_left}>
                          <StorefrontIcon
                            className={`${styles.store_icon} ${isCancelled ? styles.icon_cancelled : ""}`}
                          />
                          <div>
                            <div className={styles.store_name_row}>
                              <strong
                                className={
                                  isCancelled ? styles.text_cancelled : ""
                                }
                              >
                                {item.storeName}
                              </strong>
                              {/* 🌟 형님의 cancel_badge 스타일 적용 */}
                              {isCancelled && (
                                <span className={styles.cancel_badge}>
                                  주문취소
                                </span>
                              )}
                              {isPending && (
                                <span className={styles.pending_badge}>
                                  적립 예정
                                </span>
                              )}
                            </div>
                            <div className={styles.history_date}>
                              {item.orderDate} (주문번호:{item.orderId})
                            </div>
                          </div>
                        </div>
                        <div className={styles.history_right}>
                          {isCancelled ? (
                            /* 🌟 취소 시 형님의 text_cancelled 스타일로 "취소 완료" 표시 */
                            <span
                              className={styles.text_cancelled}
                              style={{ fontWeight: "bold" }}
                            >
                              취소 완료
                            </span>
                          ) : (
                            <div style={{ textAlign: "right" }}>
                              {/* 🌟 사용 내역 (-) 형님의 minus_point 스타일 */}
                              {hasUsed && (
                                <span
                                  className={styles.minus_point}
                                  style={{ display: "block" }}
                                >
                                  -{item.usedPoint.toLocaleString()}P
                                </span>
                              )}
                              {/* 🌟 적립 내역 (+) 형님의 plus_point 스타일 */}
                              {hasGet && (
                                <span
                                  className={
                                    isPending
                                      ? styles.point_pending
                                      : styles.plus_point
                                  }
                                  style={{ display: "block" }}
                                >
                                  {isPending ? "(예정) " : "+"}
                                  {item.getPoint.toLocaleString()}P
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              ) : (
                <div className={styles.empty_msg}>최근 내역이 없습니다. 🌱</div>
              )}
            </div>
          </Collapse>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
