import { useContext, useEffect, useState } from "react";
import styles from "../ManagerDashboard.module.css";
import OrderStatsChart from "./managerCharts/OrderStatsChart";
import ReviewStatsChart from "./managerCharts/ReviewStatsChart";
import DeliveryPathStats from "./managerCharts/DeliveryPathStats";
import { AuthContext } from "../../../../context/AuthContext";
import axios from "axios";

const StoreStats = () => {
  const { user } = useContext(AuthContext);

  const [storeId, setStoreId] = useState(null); //조회된 storeId 저장용
  const [orderStatsData, setOrderStatsData] = useState([]); // 1. 차트에 표시할 데이터 저장용
  const [isLoading, setIsLoading] = useState(true); //데이터 로딩 상태관리(가져왔는지 아직인지 확인용)

  ////////////////////////리뷰차트영역///////////////////////////
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

  const getYearMonth = () => {
    const today = new Date();
    const year = today.getFullYear(); // 4자리 연도 추출 (예: 2026)
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1, 2자리 숫자로 맞춤 (예: 4 -> '04')
    return `${year}-${month}`; // 👈 예: '2026-04'
  };

  // 아이디로 스토어번호 조회
  useEffect(() => {
    if (user && user.memberId && user.memberGrade === 2) {
      setIsLoading(true); // 요청 시작 시 로딩 상태 true로 설정
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/stores/id`, {
          params: {
            memberId: user.memberId,
          },
        })
        .then((res) => {
          console.log(res.data);
          const fetchedStoreId = res.data.storeId;
          setStoreId(fetchedStoreId);
          if (fetchedStoreId) {
            return axios.get(
              `${import.meta.env.VITE_BACKSERVER}/stores/stats/order`,
              {
                params: {
                  storeId: fetchedStoreId,
                  yearMonth: getYearMonth(), // '2026-04' 같은 현재 날짜 함수
                },
              },
            );
          }
        })
        .then((statsRes) => {
          // statsRes는 두 번째 axios 요청의 결과입니다.
          if (statsRes) {
            console.log("주문 통계 데이터:", statsRes.data);
            setOrderStatsData(statsRes.data);
          }
        })
        .catch((err) => {
          console.error("통신 에러:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setError(new Error("인증 정보가 없거나 가맹점 매니저 권한이 없습니다."));
    }
  }, [user]);

  return (
    <div className={styles.statsLayout}>
      {/*  1. 왼쪽 단일 카드 프레임 (주문 통계 + 배달 경로 통합)*/}
      <div className={`${styles.commonCard} ${styles.combinedStatsCard}`}>
        <OrderStatsChart data={orderStatsData} />
        <div className={styles.deliveryPathSection}>
          <div className={styles.centeredSubTitleGroup}>
            <h3 className={styles.sectionSubTitle}>배달 경로</h3>
          </div>
          <DeliveryPathStats data={orderStatsData} />
        </div>
      </div>

      {/*  2. 오른쪽 카드 영역 (리뷰 통계 전체) */}
      <div className={`${styles.commonCard} ${styles.rightCardArea}`}>
        <ReviewStatsChart data={reviewStatsData} />
      </div>
    </div>
  );
};
export default StoreStats;
