import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./UserOrderList.module.css";
import ReviewModal from "../../../components/layout/ReviewModal";

const UserOrderListPage = () => {
  const [orderList, setOrderList] = useState([]);
  const memberId = localStorage.getItem("memberId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!memberId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/orders/${memberId}`)
      .then((res) => {
        // 데이터가 배열인지 확인하고 세팅
        console.log(res.data);
        setOrderList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("주문 내역 불러오기 실패:", err);
        setOrderList([]);
      });
  }, [memberId]);

  const sortedOrders = useMemo(() => {
    return [...orderList].sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );
  }, [orderList]);

  const totalRecentCarbon = useMemo(() => {
    return sortedOrders
      .slice(0, 5)
      .reduce((sum, order) => sum + Number(order.getPoint ?? 0), 0);
  }, [sortedOrders]);

  const canWriteReview = (order) => {
    if (order.orderStatus !== 5) return false;
    if (order.hasReview && order.hasReview > 0) return false;
    return true;
  };

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topSummary}>
        <p className={styles.summaryLabel}>총 탄소 절감량</p>
        <h2 className={styles.summaryValue}>
          {totalRecentCarbon.toFixed(1)} g CO2
        </h2>
        <p className={styles.summaryDesc}>
          지난 5건의 주문으로 절감한 탄소량 입니다
        </p>
      </div>

      <div className={styles.orderListWrap}>
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order, index) => {
            const reviewVisible = canWriteReview(order);

            // 🌟 [수정 포인트] 고유 Key 생성
            // order.orderId가 없을 경우를 대비해 index를 조합하거나
            // 데이터가 확실치 않을 때 안전하게 식별자를 만듭니다.
            const itemKey = order.orderId
              ? `order-${order.orderId}`
              : `idx-${index}`;

            return (
              <div key={itemKey} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div className={styles.leftInfo}>
                    <img
                      src={order.menuImage}
                      alt={order.menuName || "메뉴 이미지"}
                      className={styles.menuThumb}
                    />
                    <div className={styles.mainInfo}>
                      <h3 className={styles.storeName}>{order.storeName}</h3>
                      <p className={styles.menuName}>{order.menuName}</p>
                      {order.optionString && (
                        <p className={styles.optionText}>
                          {order.optionString}
                        </p>
                      )}
                      <p className={styles.orderNo}>
                        주문 번호 {order.orderId}
                      </p>
                    </div>
                  </div>

                  <div className={styles.rightInfo}>
                    <span className={styles.statusBadge}>
                      {getOrderStatusText(order.orderStatus)}
                    </span>
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
                        style={{
                          backgroundColor: "#ccc",
                          cursor: "not-allowed",
                        }}
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
                      {Number(order.getPoint ?? 0).toFixed(1)} g
                    </strong>
                    <span>CO2</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={styles.emptyMsg}
            style={{ textAlign: "center", padding: "50px 0" }}
          >
            주문 내역이 없습니다.
          </div>
        )}
      </div>

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

const getOrderStatusText = (status) => {
  const statusMap = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: "배달중",
    5: "배달완료",
    9: "주문취소",
  };
  return statusMap[status] || "상태확인중";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
