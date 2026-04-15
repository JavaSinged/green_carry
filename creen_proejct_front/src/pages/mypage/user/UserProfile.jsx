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

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const backHost = import.meta.env.VITE_BACKSERVER;

  // 1. 상태 관리
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
  const itemsPerPage = 5; // 한 페이지당 보여줄 내역 수
  const pageGroupSize = 10;
  const filteredHistory = pointHistory.filter((item) => item.orderStatus >= 1);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;

  // 1. 현재 페이지가 몇 번째 그룹인지 계산 (예: 11페이지면 2그룹)
  const currentGroup = Math.ceil(currentPage / pageGroupSize);

  // 2. 현재 그룹의 시작 번호 (1, 11, 21...)
  const startPage = (currentGroup - 1) * pageGroupSize + 1;

  // 3. 현재 그룹의 끝 번호 (10, 20, 30... 단, 전체 페이지보다 클 순 없음)
  // 이 부분이 16개가 아니라 10개에서 끊어주는 핵심 로직입니다!
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // 4. 배열에 넣을 때 'endPage'까지만 넣기
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // 현재 페이지에 보여줄 아이템 슬라이싱
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 3. 이벤트 핸들러
  const toggleEco = () => setOpenEco(!openEco);
  const toggleHistory = () => {
    setOpenHistory(!openHistory);
    if (!openHistory) setCurrentPage(1);
  };

  const getEcoGrade = (currentCarbon) => {
    if (currentCarbon < 1000) return { name: "꼬마 씨앗 🌰", next: 1000 };
    if (currentCarbon < 3000) return { name: "파릇파릇 새싹 🌱", next: 3000 };
    if (currentCarbon < 6600) return { name: "무럭무럭 묘목 🌿", next: 6600 };
    if (currentCarbon < 10000) return { name: "든든한 나무 🌳", next: 10000 };
    return { name: "울창한 숲 🌲", next: null };
  };
  const myGradeInfo = getEcoGrade(totalCarbon);
  const fetchUserData = useCallback(async () => {
    if (!user?.memberId) return;
    try {
      const token = localStorage.getItem("accessToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 포인트 내역
      const historyRes = await axios.get(
        `${backHost}/member/point-history/${user.memberId}`,
        config,
      );
      setPointHistory(historyRes.data);

      // 탄소 절감량
      const carbonRes = await axios.get(`${backHost}/member/total-carbon`, {
        params: { memberId: user.memberId },
        ...config,
      });
      // 만약 carbonRes.data가 객체라면 .totalCarbonReduce를, 숫자라면 그대로
      const carbonVal =
        typeof carbonRes.data === "object"
          ? carbonRes.data.totalCarbonReduce
          : carbonRes.data;
      setTotalCarbon(Math.floor(carbonVal * 1000));

      const commRes = await axios.get(`${backHost}/member/community-carbon`);
      setCommunityPoint(commRes.data);

      console.log("데이터 새로고침 성공");
    } catch (err) {
      console.error("데이터 로딩 실패", err);
    }
  }, [user?.memberId, backHost]);

  // 5. useEffect 훅
  useEffect(() => {
    const handleAutoUpdate = () => {
      const savedPoint = localStorage.getItem("memberPoint");
      if (savedPoint) setPoint(Number(savedPoint));
      fetchUserData();
    };
    window.addEventListener("pointUpdated", handleAutoUpdate);
    fetchUserData();
    return () => window.removeEventListener("pointUpdated", handleAutoUpdate);
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

  // 6. JSX 렌더링
  return (
    <div className={styles.right}>
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
              <p className={styles.dashboard_value}>
                {totalCarbon.toLocaleString()}g
              </p>
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

        <div className={styles.collapse_wrapper}>
          <div className={styles.collapse_header} onClick={toggleHistory}>
            <p>
              적립 내역{" "}
              <span className={styles.history_sub}>최근 3개월 적립 내역</span>
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
                    const isCancelled = item.orderStatus === 9;
                    const isPending =
                      item.orderStatus >= 1 && item.orderStatus <= 4;
                    const actualGetPoint =
                      isCancelled && item.pointReward === 0 ? 0 : item.getPoint;

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
                              {isCancelled && (
                                <span className={styles.cancel_badge}>
                                  결제취소
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
                          {isPending ? (
                            <span className={styles.point_pending}>
                              적립 예정
                            </span>
                          ) : isCancelled && actualGetPoint === 0 ? (
                            <span className={styles.text_cancelled}>
                              적립 취소
                            </span>
                          ) : (
                            <span
                              className={
                                isCancelled
                                  ? styles.point_refund_minus
                                  : styles.plus_point
                              }
                            >
                              {isCancelled ? "-" : "+"}
                              {actualGetPoint.toLocaleString()}P
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 페이지네이션 버튼부 */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.page_btn}
                        onClick={() => setCurrentPage(startPage - 1)}
                        disabled={startPage === 1}
                      >
                        이전
                      </button>
                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => setCurrentPage(number)}
                          className={
                            currentPage === number
                              ? styles.activePage
                              : styles.page_num
                          }
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        className={styles.page_btn}
                        onClick={() => setCurrentPage(endPage + 1)}
                        disabled={endPage === totalPages}
                      >
                        다음
                      </button>
                    </div>
                  )}
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
