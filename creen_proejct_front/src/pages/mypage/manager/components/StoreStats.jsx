import { useEffect, useState } from "react";
import styles from "../ManagerDashboard.module.css";
import OrderStatsChart from "./managerCharts/OrderStatsChart";
import ReviewStatsChart from "./managerCharts/ReviewStatsChart";
import DeliveryPathStats from "./managerCharts/DeliveryPathStats";

export default function StoreStats() {
  // 1. 차트 데이터를 저장할 상태 (초기값은 더미 데이터 형태)
  const [orderStatsData, setOrderStatsData] = useState({
    totalAmount: 1178909,
    currentMonthAmount: 1178909,
    // Radial Bar를 위한 데이터 비율
    series: [40, 55, 15],
  });

  const [reviewStatsData, setReviewStatsData] = useState({
    totalCount: 140,
    changePercent: 4.5, // +4.5% 지난 주보다
    reviewCounts: {
      star5: 56, // 40%
      star4: 42, // 30%
      star3: 49, // 35%
      star1: 21, // 15% (청록)
    },
    // Semi-Donut을 위한 데이터 비율
    series: [40, 30, 35, 15], // 5점, 4점, 3점, 1점 비율
  });

  const [deliveryPathData, setDeliveryPathData] = useState([
    { type: "포장", percent: 35, color: "#ffb300" },
    { type: "도보 & 자전거", percent: 55, color: "#2e8147" },
    { type: "오토바이", percent: 15, color: "#c0e0b0" },
  ]);

  // 2. 초기 데이터 로드 (API 호출 부분 명시)
  useEffect(() => {
    /* TODO: Axios를 사용하여 실제 데이터를 가져옵니다.
      예시:
      const fetchData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKSERVER}/manager/dashboard/stats`);
          const data = response.data;

          // 데이터를 컴포넌트 형식에 맞게 변환하여 상태 업데이트
          // setOrderStatsData({ ... });
          // setReviewStatsData({ ... });
          // setDeliveryPathData([ ... ]);
        } catch (error) {
          console.error("데이터 불러오기 실패:", error);
        }
      };
      fetchData();
    */
  }, []);

  return (
    <div className={styles.statsLayout}>
      {/*  1. 왼쪽 단일 카드 프레임 (주문 통계 + 배달 경로 통합)*/}
      <div className={`${styles.commonCard} ${styles.combinedStatsCard}`}>
        <OrderStatsChart data={orderStatsData} />
        <div className={styles.deliveryPathSection}>
          <div className={styles.centeredSubTitleGroup}>
            <h3 className={styles.sectionSubTitle}>배달 경로</h3>
          </div>
          <DeliveryPathStats data={deliveryPathData} />
        </div>
      </div>

      {/*  2. 오른쪽 카드 영역 (리뷰 통계 전체) */}
      <div className={`${styles.commonCard} ${styles.rightCardArea}`}>
        <ReviewStatsChart data={reviewStatsData} />
      </div>
    </div>
  );
}
