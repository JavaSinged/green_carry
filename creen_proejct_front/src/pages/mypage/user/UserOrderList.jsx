import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./UserOrderList.module.css";

const UserOrderListPage = () => {
  const navigate = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const memberId = localStorage.getItem("memberId");

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

  const canWriteReview = (orderDate) => {
    if (!orderDate) return false;

    const now = new Date();
    const orderedAt = new Date(orderDate);
    const diff = now.getTime() - orderedAt.getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    return diff >= 0 && diff <= threeDays;
  };

  const moveReviewPage = (orderId) => {
    navigate(`/review/write?orderId=${orderId}`);
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
          const reviewVisible = canWriteReview(order.orderDate);

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

                  {reviewVisible ? (
                    <button
                      className={styles.reviewBtn}
                      onClick={() => moveReviewPage(order.orderId)}
                    >
                      리뷰 작성 (3일 이내)
                    </button>
                  ) : null}
                </div>
              </div>

              <div className={styles.orderMiddle}>
                <div className={styles.infoBlock}>
                  <p className={styles.infoTitle}>주문 정보</p>
                  <p>
                    {order.quantity}개{" "}
                    {Number(order.price ?? 0).toLocaleString()}원
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
    </div>
  );
};

export default UserOrderListPage;

// 주문상태 텍스트
const getOrderStatusText = (status) => {
  switch (status) {
    case 0:
      return "주문접수";
    case 1:
      return "조리중";
    case 2:
      return "배달중";
    case 3:
      return "배달완료";
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
