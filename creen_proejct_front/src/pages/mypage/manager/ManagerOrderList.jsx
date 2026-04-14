import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManagerOrderList.module.css";
import Swal from "sweetalert2";

const ManagerOrderList = () => {
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetailsData, setOrderDetailsData] = useState({});

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const storeId = localStorage.getItem("storeId");

  const fetchStoreOrders = () => {
    if (!storeId) return;
    setIsLoading(true);

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/orders/owner/${storeId}`)
      .then((res) => {
        setOrderList(Array.isArray(res.data) ? res.data : []);
        console.log("🚀 ~ fetchStoreOrders ~ res.data:", res.data);
      })
      .catch((err) => {
        console.error("주문 내역 불러오기 실패:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchStoreOrders();
  }, [storeId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 🌟 공통 API 호출 함수
  const requestStatusUpdate = (orderId, nextStatus, expectedTime = null) => {
    axios
      .patch(
        `${import.meta.env.VITE_BACKSERVER}/stores/order/${orderId}/status`,
        {
          status: nextStatus,
          expectedTime: expectedTime, // 서버로 시간(분) 전송
        },
      )
      .then(() => {
        Swal.fire("성공", "주문 상태가 변경되었습니다.", "success");
        fetchStoreOrders();
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("오류", "상태 변경에 실패했습니다.", "error");
      });
  };
  const toggleOrderDetails = async (orderId) => {
    // 이미 열려있으면 닫기
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    // 열기
    setExpandedOrderId(orderId);

    // 한 번도 안 불러왔던 데이터면 서버에서 가져오기
    if (!orderDetailsData[orderId]) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/stores/order/${orderId}`,
        );
        setOrderDetailsData((prev) => ({
          ...prev,
          [orderId]: res.data.items || [],
        }));
      } catch (err) {
        console.error("상세 메뉴 불러오기 실패:", err);
      }
    }
  };

  // 🌟 주문 상태 업데이트 로직 (시간 설정 포함)
  const updateOrderStatus = (orderId, currentStatus, deliveryType) => {
    const nextStatus = currentStatus + 1;
    const isPickup = deliveryType === 1;

    // 1. 주문 수락 단계 (접수대기 -> 주문접수)
    if (currentStatus === 1) {
      Swal.fire({
        title: isPickup ? "예상 픽업 소요 시간" : "예상 배달 소요 시간",
        html: `
          <div style="margin: 20px 0;">
            <b id="range-value" style="font-size: 2.5rem; color: #2f8f46;">15</b>
            <span style="font-size: 1.2rem; font-weight: bold;">분</span>
          </div>
        `,
        input: "range",
        inputAttributes: {
          min: "5",
          max: "120",
          step: "1", // 1분 단위 조절 가능
        },
        inputValue: 15,
        showCancelButton: true,
        confirmButtonText: "주문 수락",
        cancelButtonText: "취소",
        confirmButtonColor: "#2f8f46",
        didOpen: () => {
          const input = Swal.getInput();
          const output = Swal.getHtmlContainer().querySelector("#range-value");
          // 슬라이더 조절 시 화면의 숫자를 실시간으로 변경
          input.addEventListener("input", () => {
            output.innerText = input.value;
          });
        },
      }).then((result) => {
        if (result.isConfirmed) {
          requestStatusUpdate(orderId, nextStatus, result.value);
        }
      });
    } else {
      // 2. 나머지 단계 (조리중, 배달중 등)
      let confirmMsg = "";
      if (currentStatus === 2) confirmMsg = "조리를 시작하시겠습니까?";
      else if (currentStatus === 3) {
        confirmMsg = isPickup
          ? "픽업 준비가 완료되었습니까?"
          : "배달을 출발시키겠습니까?";
      } else if (currentStatus === 4) {
        confirmMsg = isPickup
          ? "픽업이 완료되었습니까?"
          : "배달이 완료되었습니까?";
      }

      Swal.fire({
        title: "상태 변경",
        text: confirmMsg,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "확인",
        cancelButtonText: "취소",
      }).then((result) => {
        if (result.isConfirmed) {
          requestStatusUpdate(orderId, nextStatus);
        }
      });
    }
  };

  const cancelOrder = (orderId) => {
    Swal.fire({
      title: "주문 취소",
      text: "정말 이 주문을 취소(거절)하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "취소 확정",
      cancelButtonText: "돌아가기",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            `${import.meta.env.VITE_BACKSERVER}/stores/order/${orderId}/status`,
            {
              status: 9,
            },
          )
          .then(() => {
            Swal.fire("취소 완료", "주문이 취소되었습니다.", "success");
            fetchStoreOrders();
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("오류", "주문 취소에 실패했습니다.", "error");
          });
      }
    });
  };

  const sortedOrders = [...orderList].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 🌟 주소 마스킹 함수 (상세 주소 가리기)
  const maskAddress = (address) => {
    if (!address) return "주소 정보 없음";
    const parts = address.split(" ");
    // 주소의 3번째 마디까지만 보여주고 이후는 마스킹 (예: 서울시 강남구 역삼동 ***)
    if (parts.length <= 3) return address;
    return `${parts[0]} ${parts[1]} ${parts[2]} ***`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerArea}>
        <h2 className={styles.pageTitle}>📦 매장 주문 관리</h2>
        <button
          className={styles.refreshBtn}
          onClick={() => {
            fetchStoreOrders();
            setCurrentPage(1);
          }}
        >
          새로고침 🔄
        </button>
      </div>

      <div className={styles.orderListWrap}>
        {isLoading ? (
          <p className={styles.loadingText}>주문을 불러오는 중입니다...</p>
        ) : currentOrders.length > 0 ? (
          currentOrders.map((order) => {
            const isCanceled = order.orderStatus === 9;
            const isNewOrder = order.orderStatus === 1;

            return (
              <div
                key={`store-order-${order.orderId}`}
                className={`${styles.orderCard} ${isNewOrder ? styles.newOrder : ""} ${isCanceled ? styles.canceledCard : ""}`}
              >
                {isCanceled && (
                  <div className={styles.canceledWatermark}>취소된 주문</div>
                )}

                <div className={styles.orderHeader}>
                  <div className={styles.headerLeft}>
                    <span
                      className={`${styles.orderNo} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      주문번호 #{order.orderId}
                    </span>
                    {isNewOrder && !isCanceled && (
                      <span className={styles.newBadge}>NEW</span>
                    )}
                  </div>
                  <span className={styles.orderDate}>{order.orderDate}</span>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.menuInfo}>
                    <h3
                      className={`${styles.menuName} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      {order.menuName}{" "}
                      {order.extraCount > 0 && `외 ${order.extraCount}건`}
                    </h3>

                    {/* 🌟 여기에 상세 메뉴 토글 버튼과 리스트가 추가되었습니다 */}
                    {order.extraCount > 0 && (
                      <div className={styles.detailToggleWrap}>
                        <button
                          className={styles.detailToggleBtn}
                          onClick={() => toggleOrderDetails(order.orderId)}
                        >
                          {expandedOrderId === order.orderId
                            ? "상세메뉴 닫기 ▲"
                            : "상세메뉴 보기 ▼"}
                        </button>

                        {expandedOrderId === order.orderId &&
                          orderDetailsData[order.orderId] && (
                            <ul className={styles.subMenuList}>
                              {orderDetailsData[order.orderId].map(
                                (item, idx) => (
                                  <li
                                    key={idx}
                                    className={
                                      isCanceled ? styles.strikeThrough : ""
                                    }
                                  >
                                    - {item.menuName}{" "}
                                    <strong style={{ color: "#2f8f46" }}>
                                      {item.quantity}개
                                    </strong>
                                    {item.optionString
                                      ? ` (${item.optionString})`
                                      : ""}
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                      </div>
                    )}

                    <p className={styles.price}>
                      결제금액:{" "}
                      <strong
                        className={isCanceled ? styles.strikeThrough : ""}
                      >
                        {isCanceled
                          ? "0"
                          : Number(order.totalPrice).toLocaleString()}
                        원
                      </strong>
                    </p>
                  </div>

                  <div className={styles.deliveryInfo}>
                    <p className={isCanceled ? styles.strikeThrough : ""}>
                      <strong>배달 방식:</strong>{" "}
                      {order.deliveryType === 1
                        ? "픽업"
                        : order.deliveryType === 2
                          ? "도보/자전거"
                          : "오토바이"}
                    </p>
                    <p
                      className={`${styles.address} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      <strong>주소:</strong>{" "}
                      {maskAddress(order.deliveryAddress)}
                    </p>
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.statusDisplay}>
                    상태:{" "}
                    <span
                      className={`${styles.statusBadge} ${isCanceled ? styles.canceledBadge : styles[`status_${order.orderStatus}`]}`}
                    >
                      {getOrderStatusText(
                        order.orderStatus,
                        order.deliveryType,
                      )}
                    </span>
                  </div>

                  <div className={styles.actionButtons}>
                    {order.orderStatus >= 1 && order.orderStatus < 5 && (
                      <button
                        className={styles.nextStepBtn}
                        onClick={() =>
                          updateOrderStatus(
                            order.orderId,
                            order.orderStatus,
                            order.deliveryType,
                          )
                        }
                      >
                        {getActionText(order.orderStatus, order.deliveryType)}
                      </button>
                    )}
                    {order.orderStatus === 1 && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => cancelOrder(order.orderId)}
                      >
                        주문 거절
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyMsg}>현재 들어온 주문이 없습니다.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagerOrderList;

const getOrderStatusText = (status, deliveryType) => {
  const isPickup = deliveryType === 1;
  const map = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: isPickup ? "픽업대기" : "배달중",
    5: isPickup ? "픽업완료" : "배달완료",
    9: "주문취소",
  };
  return map[status] || "확인중";
};

const getActionText = (status, deliveryType) => {
  const isPickup = deliveryType === 1;
  const map = {
    1: "주문 수락하기",
    2: "조리 시작하기",
    3: isPickup ? "픽업 준비 완료하기" : "배달 출발하기",
    4: isPickup ? "픽업 완료처리" : "배달 완료처리",
  };
  return map[status] || "";
};
