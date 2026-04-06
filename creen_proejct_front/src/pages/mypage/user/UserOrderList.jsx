import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./UserOrderList.module.css";
import ReviewModal from "../../../components/layout/ReviewModal"; // 🌟 1. 모달 컴포넌트 임포트

const UserOrderListPage = () => {
  const [orderList, setOrderList] = useState([]);
  const memberId = localStorage.getItem("memberId");

  // 🌟 2. 모달 제어를 위한 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/orders/${memberId}`)
      .then((res) => {
        console.log(res.data);
        setOrderList(res.data ?? []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 주문일 최신순 정렬
  const sortedOrders = useMemo(() => {
    return [...orderList].sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );
  }, [orderList]);

  // 최근 5개 주문 탄소 절감량 합계
  const totalRecentCarbon = useMemo(() => {
    return sortedOrders
      .slice(0, 5)
      .reduce((sum, order) => sum + Number(order.orderCarbon ?? 0), 0);
  }, [sortedOrders]);

  // 🌟 3. 리뷰 작성 조건 정교화 (배달완료 + 3일이내 + 리뷰 미작성)
  const canWriteReview = (order) => {
    console.log(`주문번호 ${order.orderId}의 데이터:`, order);

    // 1. 배달완료(5)가 아니면 불가
    if (order.orderStatus !== 5) return false;

    // 2. 이미 리뷰를 썼다면 불가
    if (order.hasReview && order.hasReview > 0) return false;

    // --- 🚨 여기가 핵심! 날짜 계산 통째로 무시하기 🚨 ---
    /*
    if (!order.orderDate) return false;
    const now = new Date();
    const orderedAt = new Date(order.orderDate);
    const diff = now.getTime() - orderedAt.getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    return diff >= 0 && diff <= threeDays;
    */

    // 3. 배달완료(5)이고 리뷰 안 썼으면 무조건 띄우기!
    return true;
  };

  // 🌟 4. 페이지 이동 대신 모달 열기 함수로 변경
  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topSummary}>
        <p className={styles.summaryLabel}>총 탄소 절감량</p>
        <h2 className={styles.summaryValue}>
          {(totalRecentCarbon / 1000).toFixed(3)} kg CO2
        </h2>
        <p className={styles.summaryDesc}>
          지난 5건의 주문으로 절감한 탄소량 입니다
        </p>
      </div>

      <div className={styles.orderListWrap}>
        {sortedOrders.map((order) => {
          // 파라미터를 order 객체 전체로 변경
          const reviewVisible = canWriteReview(order);

          return (
            <div key={order.orderId} className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div className={styles.leftInfo}>
                  <img
                    src={order.menuImage}
                    alt={order.menuName}
                    className={styles.menuThumb}
                  />

                  <div className={styles.mainInfo}>
                    <h3 className={styles.storeName}>{order.storeName}</h3>
                    <p className={styles.menuName}>{order.menuName}</p>
                    {order.optionString ? (
                      <p className={styles.optionText}>{order.optionString}</p>
                    ) : null}
                    <p className={styles.orderNo}>주문 번호 {order.orderId}</p>
                  </div>
                </div>

                <div className={styles.rightInfo}>
                  <span className={styles.statusBadge}>
                    {getOrderStatusText(order.orderStatus)}
                  </span>

                  {/* 🌟 5. 조건에 맞춰 리뷰 버튼 렌더링 */}
                  {reviewVisible ? (
                    <button
                      className={styles.reviewBtn}
                      onClick={() => openReviewModal(order)}
                    >
                      리뷰 작성 (3일 이내)
                    </button>
                  ) : order.hasReview > 0 ? (
                    <button
                      className={styles.reviewBtn}
                      disabled
                      style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}
                    >
                      리뷰 작성 완료
                    </button>
                  ) : null}
                </div>
              </div>

              <div className={styles.orderMiddle}>
                <div className={styles.infoBlock}>
                  <p className={styles.infoTitle}>주문 정보</p>
                  <p>
                    {order.totalCount}개{" "}
                    {Number(order.totalPrice ?? 0).toLocaleString()}원
                  </p>
                </div>

                <div className={styles.infoBlock}>
                  <p className={styles.infoTitle}>주문 날짜</p>
                  <p>{formatDate(order.orderDate)}</p>
                </div>

                <div className={styles.infoBlock}>
                  <p className={styles.infoTitle}>매장 주소</p>
                  <p>{order.storeAddress}</p>
                </div>

                <div className={styles.infoBlock}>
                  <p className={styles.infoTitle}>배달 주소</p>
                  <p>{order.deliveryAddress}</p>
                </div>
              </div>

              <div className={styles.carbonBox}>
                <div>
                  <p className={styles.carbonLabel}>
                    이 주문으로 절감한 탄소량
                  </p>
                  <p className={styles.carbonDesc}>
                    친환경 포장재 및 로컬 배송
                  </p>
                </div>

                <div className={styles.carbonValueWrap}>
                  <strong className={styles.carbonValue}>
                    {(Number(order.orderCarbon ?? 0) / 1000).toFixed(3)} kg
                  </strong>
                  <span>CO2</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 6. 모달 컴포넌트 마운트 (isModalOpen이 true일 때만 렌더링) */}
      {isModalOpen && selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserOrderListPage;

// 🛠️ 새로 알려주신 주문상태 코드로 완벽 업데이트!
const getOrderStatusText = (status) => {
  switch (status) {
    case 0:
      return "결제대기";
    case 1:
      return "접수대기";
    case 2:
      return "주문접수";
    case 3:
      return "조리중";
    case 4:
      return "배달중";
    case 5:
      return "배달완료";
    case 9:
      return "주문취소";
    default:
      return "상태확인중";
  }
};

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
