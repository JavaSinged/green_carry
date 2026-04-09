import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./UserOrderList.module.css";
import ReviewModal from "../../../components/layout/ReviewModal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const UserOrderListPage = () => {
  const backHost = import.meta.env.VITE_BACKSERVER;
  const navigate = useNavigate();
  const [orderList, setOrderList] = useState([]);
  const memberId = localStorage.getItem("memberId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const todayStr = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  // 검색어 상태 (요청하신 로직에 포함되어 있어 추가)
  const [searchKeyword, setSearchKeyword] = useState("");

  // 🌟 [페이지네이션 상태 및 로직 시작] ---------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [pageGroup, setPageGroup] = useState(0);
  const pageLimit = 5;

  // 1. 필터링 로직 (날짜 필터 + 매장명 검색 통합)
  const filteredList = useMemo(() => {
    let filtered = [...orderList];

    // 날짜 필터
    if (startDate) {
      filtered = filtered.filter(
        (order) => new Date(order.orderDate) >= new Date(startDate),
      );
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => new Date(order.orderDate) <= end);
    }
    // 매장명 검색 필터
    if (searchKeyword) {
      filtered = filtered.filter((item) =>
        item.storeName?.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }
    return filtered;
  }, [orderList, startDate, endDate, searchKeyword]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  // 2. 정렬 로직 (기본은 최신순)
  const sortedList = useMemo(() => {
    return [...filteredList].sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );
  }, [filteredList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // 현재 페이지 아이템
  const currentOrders = sortedList.slice(indexOfFirstItem, indexOfLastItem);

  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  // 페이지 이동 핸들러
  const handlePrevGroup = () => {
    if (pageGroup > 0) {
      setPageGroup(pageGroup - 1);
      setCurrentPage((pageGroup - 1) * pageLimit + 1);
    }
  };
  const handleNextGroup = () => {
    const maxGroup = Math.floor((totalPages - 1) / pageLimit);
    if (pageGroup < maxGroup) {
      setPageGroup(pageGroup + 1);
      setCurrentPage((pageGroup + 1) * pageLimit + 1);
    }
  };
  // ----------------------------------------------------------- [로직 끝]

  const fetchOrders = () => {
    if (!memberId) return;
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/orders/${memberId}`)
      .then((res) => {
        setOrderList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("주문 내역 불러오기 실패:", err);
        setOrderList([]);
      });
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [memberId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 필터 변경 시 1페이지로
  useEffect(() => {
    setCurrentPage(1);
    setPageGroup(0);
  }, [startDate, endDate, searchKeyword]);

  const cancelOrder = (orderId) => {
    Swal.fire({
      title: "주문 취소",
      text: "정말 주문을 취소하시겠습니까?",
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
            { status: 9 },
          )
          .then(() => {
            Swal.fire(
              "취소 완료",
              "주문이 정상적으로 취소되었습니다.",
              "success",
            );
            fetchOrders();
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("오류", "주문 취소에 실패했습니다.", "error");
          });
      }
    });
  };

  const totalRecentCarbon = useMemo(() => {
    return filteredList
      .slice(0, 5)
      .reduce((sum, order) => sum + Number(order.getPoint ?? 0), 0);
  }, [filteredList]);

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSearchKeyword("");
    setCurrentPage(1);
    setPageGroup(0);
  };

  const goToCheckoutPage = (order) => {
    const tossStyleOrderId = `ORDER_${order.orderId}_${new Date().getTime()}`;
    const amount = order.totalPrice || 0;
    navigate(`/checkoutPage?orderId=${tossStyleOrderId}&amount=${amount}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topSummary}>
        <p className={styles.summaryLabel}>총 탄소 절감량</p>
        <h2 className={styles.summaryValue}>
          {totalRecentCarbon.toFixed(1)} g CO2
        </h2>
        <p className={styles.summaryDesc}>
          목록 상단 5건의 주문으로 절감한 탄소량 입니다 🌱
        </p>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.dateInputs}>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={todayStr}
          />
          <span className={styles.dateSeparator}>~</span>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={todayStr}
          />
        </div>
        <button className={styles.resetBtn} onClick={resetFilter}>
          초기화
        </button>
      </div>

      <div className={styles.orderListWrap}>
        {currentOrders.length > 0 ? (
          currentOrders.map((order, index) => {
            const isCompleted = order.orderStatus === 5;
            const isCanceled = order.orderStatus === 9;
            const isNotReviewed = Number(order.reviewStatus) === 0;
            const isAlreadyReviewed = Number(order.reviewStatus) === 1;
            const orderDateObj = new Date(order.orderDate);
            const now = new Date();
            const diffDays =
              (now.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24);
            const isWithin3Days = diffDays <= 3;
            const itemKey = order.orderId
              ? `order-${order.orderId}`
              : `idx-${index}`;

            return (
              <div
                key={itemKey}
                className={`${styles.orderCard} ${isCanceled ? styles.canceledCard : ""}`}
                onClick={() => goToCheckoutPage(order)}
                style={{ cursor: "pointer" }}
              >
                {isCanceled && (
                  <div className={styles.canceledWatermark}>취소된 주문</div>
                )}

                <div className={styles.orderTop}>
                  <div className={styles.leftInfo}>
                    <img
                      src={
                        order.storeThumb
                          ? `${backHost}/${order.storeThumb}`
                          : "/img/no-image.png"
                      }
                      alt={order.menuName || "메뉴"}
                      className={`${styles.menuThumb} ${isCanceled ? styles.canceledImg : ""}`}
                    />
                    <div className={styles.mainInfo}>
                      <h3 className={styles.storeName}>{order.storeName}</h3>
                      <p className={styles.menuName}>{order.menuName}</p>
                      <p className={styles.orderNo}>
                        주문 번호 {order.orderId}
                      </p>
                    </div>
                  </div>

                  <div className={styles.rightInfo}>
                    <span
                      className={`${styles.statusBadge} ${isCanceled ? styles.canceledBadge : ""}`}
                    >
                      {getOrderStatusText(
                        order.orderStatus,
                        order.deliveryType,
                      )}
                    </span>

                    {(order.orderStatus === 0 || order.orderStatus === 1) && (
                      <button
                        className={styles.cancelBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelOrder(order.orderId);
                        }}
                      >
                        주문 취소
                      </button>
                    )}

                    {isCompleted &&
                      (isAlreadyReviewed ? (
                        <button className={styles.reviewBtnDisabled} disabled>
                          작성 완료
                        </button>
                      ) : isNotReviewed && isWithin3Days ? (
                        <button
                          className={styles.reviewBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewModal(order);
                          }}
                        >
                          리뷰 작성 (3일 이내)
                        </button>
                      ) : (
                        <button className={styles.reviewBtnDisabled} disabled>
                          작성 기한 만료
                        </button>
                      ))}
                  </div>
                </div>

                <div className={styles.orderMiddle}>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>주문 정보</p>
                    <p className={isCanceled ? styles.strikeThrough : ""}>
                      {order.totalCount}개 |{" "}
                      {Number(order.totalPrice ?? 0).toLocaleString()}원
                    </p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>주문 날짜</p>
                    <p>{formatDate(order.orderDate)}</p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>매장 위치</p>
                    <p className={styles.addressText}>
                      {order.storeAddress || "정보 없음"}
                    </p>
                  </div>
                  <div className={styles.infoBlock}>
                    <p className={styles.infoTitle}>
                      {order.deliveryType === 1 ? "수령 방식" : "배달 주소"}
                    </p>
                    <p className={styles.addressText}>
                      {order.deliveryType === 1
                        ? "매장 방문 픽업"
                        : order.deliveryAddress}
                    </p>
                  </div>
                </div>

                <div className={styles.carbonBox}>
                  <div className={styles.carbonText}>
                    <p className={styles.carbonLabel}>
                      이 주문으로 절감한 탄소량
                    </p>
                    <p className={styles.carbonDesc}>
                      친환경 포장재 및 로컬 배송/픽업
                    </p>
                  </div>
                  <div className={styles.carbonValueWrap}>
                    <strong
                      className={`${styles.carbonValue} ${isCanceled ? styles.strikeThrough : ""}`}
                    >
                      {isCanceled
                        ? "0.0"
                        : Number(order.getPoint ?? 0).toFixed(1)}{" "}
                      g
                    </strong>
                    <span>CO2</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyMsg}>
            해당 기간에 주문 내역이 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 영역*/}
      <div className={styles.pagination}>
        <button
          className={styles.page_btn_nav}
          onClick={handlePrevGroup}
          disabled={pageGroup === 0}
        >
          <ChevronLeftIcon fontSize="small" />
          이전
        </button>

        <div className={styles.page_numbers}>
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i,
          ).map((num) => (
            <div
              key={num}
              className={`${styles.page_num} ${
                currentPage === num ? styles.active : ""
              }`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </div>
          ))}
        </div>

        <button
          className={styles.page_btn_nav}
          onClick={handleNextGroup}
          disabled={endPage === totalPages || totalPages === 0}
        >
          다음
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>

      {isModalOpen && selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
};

export default UserOrderListPage;

// 보조 함수들
const getOrderStatusText = (status, deliveryType) => {
  const isPickup = deliveryType === 1;
  const statusMap = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: isPickup ? "픽업대기" : "배달중",
    5: isPickup ? "픽업완료" : "배달완료",
    9: "주문취소",
  };
  return statusMap[status] || "확인중";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
