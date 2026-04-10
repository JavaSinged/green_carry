import React, { useEffect, useRef, useState, useContext } from "react";
import styles from "./CheckoutPage.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";

const CheckoutPage = () => {
  const { clearCart } = useCartStore();
  const { user, setUser } = useContext(AuthContext);
  const cartList = useCartStore((state) => state.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const mapElement = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const STORE_INFO = { lat: 37.497952, lng: 127.027619 };
  const [orderList, setOrderList] = useState([]);
  const [usedPoint, setUsedPoint] = useState(0);
  const [getPoint, setGetPoint] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [completeDate, setCompleteDate] = useState("");
  const [orderAmount, setOrderAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const params = new URLSearchParams(location.search);
  const paymentOrderId = params.get("orderId");
  const orderId = paymentOrderId ? Number(paymentOrderId.split("_")[1]) : null;
  const [storeName, setStoreName] = useState("");

  // 상태 관리를 위한 State
  const [orderState, setOrderState] = useState(0);
  const [rawOrderStatus, setRawOrderStatus] = useState(0);
  const [orderDate, setOrderDate] = useState("");
  const [confirmDate, setConfirmDate] = useState(""); // 🌟 [추가] 주문 수락 시각
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [deliveryType, setDeliveryType] = useState(0);

  // 예상 시간(분) 및 카운트다운 텍스트 상태
  const [expectedTime, setExpectedTime] = useState(null);
  const [remainingTimeText, setRemainingTimeText] = useState("시간 계산 중...");
  const [targetArrivalTime, setTargetArrivalTime] = useState("--:--");

  const fetchOrderDetails = () => {
    if (!orderId) return;

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/order/${orderId}`)
      .then((res) => {
        setOrderList(res.data.items ?? []);
        setUsedPoint(Number(res.data.usedPoint ?? 0));
        setGetPoint(Number(res.data.getPoint ?? 0));
        setDeliveryPrice(Number(res.data.deliveryPrice ?? 0));
        setStoreName(res.data.storeName);
        setDeliveryType(res.data.deliveryType ?? 0);

        const status = res.data.orderStatus ?? 0;
        setRawOrderStatus(status);
        setOrderDate(res.data.orderDate);
        setConfirmDate(res.data.confirmDate); // 🌟 [추가] 서버에서 수락 시각 받아오기
        setTotalCarbon(res.data.totalReduceCarbon);
        setCompleteDate(res.data.completeDate);

        setExpectedTime(res.data.expectedTime ?? null);

        if (status === 9 || status < 2) {
          setOrderState(-1);
        } else {
          setOrderState(status - 2);
        }
      })
      .catch((err) => {
        console.error("주문 정보 갱신 실패:", err);
      });
  };

  const updatePoint = (orderId) => {
    axios
      .patch(`${import.meta.env.VITE_BACKSERVER}/stores/updatePoint/${orderId}`)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    clearCart();
    fetchOrderDetails();
    updatePoint(orderId);

    const intervalId = setInterval(() => {
      fetchOrderDetails();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  useEffect(() => {
    const fetchLatestPoint = async () => {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) return;

      try {
        // 1. 백엔드에서 결제가 모두 반영된 "최신 진짜 포인트"를 가져옵니다.
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/member/${memberId}`,
        );
        const latestPoint = res.data.memberPoint || 0;

        // 2. 로컬 스토리지 업데이트 (새로고침 대비)
        localStorage.setItem("memberPoint", latestPoint);

        // 3. 전역 컨텍스트 업데이트 (화면 즉시 반영)
        if (user) {
          setUser({ ...user, memberPoint: latestPoint });
        }
      } catch (err) {
        console.error("최신 포인트 갱신 실패:", err);
      }
    };

    // 페이지가 열리면 즉시 최신 포인트를 동기화!
    fetchLatestPoint();
  }, []);

  // 🌟 [핵심 로직] 주문 수락 시각 기준 카운트다운 타이머
  useEffect(() => {
    if (rawOrderStatus === 5 && completeDate) {
      setTargetArrivalTime(completeDate.split(" ")[1]); // 시:분만 추출
      setRemainingTimeText("이용해 주셔서 감사합니다!");
      return;
    }
    // 1. 주문이 수락되지 않았거나(confirmDate 없음), 취소/완료 상태면 타이머 중단
    if (
      !confirmDate ||
      !expectedTime ||
      rawOrderStatus === 9 ||
      rawOrderStatus === 5
    ) {
      if (rawOrderStatus === 9) setRemainingTimeText("");
      else if (rawOrderStatus === 5)
        setRemainingTimeText("이용해 주셔서 감사합니다!");
      else setRemainingTimeText("가게 수락 대기 중...");
      setTargetArrivalTime("--:--");
      return;
    }

    // 2. 날짜 객체 생성 (SQL 포맷 공백을 'T'로 치환하여 브라우저 호환성 확보)
    const safeConfirmDate = confirmDate.replace(" ", "T");
    const targetDate = new Date(safeConfirmDate);

    // 3. 수락 시각에 사장님이 설정한 예상 시간(분) 더하기
    targetDate.setMinutes(targetDate.getMinutes() + Number(expectedTime));

    // 4. 도착 예정 시각 텍스트 세팅 (HH:MM)
    const h = String(targetDate.getHours()).padStart(2, "0");
    const m = String(targetDate.getMinutes()).padStart(2, "0");
    setTargetArrivalTime(`${h}:${m}`);

    // 5. 1초마다 남은 시간을 계산하는 함수
    const updateTimer = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      // 시간이 다 됐을 때 처리
      if (diffMs <= 0) {
        setRemainingTimeText(
          deliveryType === 1 ? "픽업할 시간이에요! 🏃‍♂️" : "곧 도착합니다! 🛵",
        );
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      setRemainingTimeText(`${diffMins}분 ${diffSecs}초 남음`);
    };

    updateTimer(); // 즉시 실행
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId); // 컴포넌트 언마운트 시 클리어
  }, [confirmDate, expectedTime, rawOrderStatus, deliveryType]);

  const cancelOrder = () => {
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
            ).then(() => {
              navigate("/mypage/user/orderList");
            });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("오류", "주문 취소를 실패했습니다.", "error");
          });
      }
    });
  };

  useEffect(() => {
    const total = orderList.reduce((sum, item) => {
      return sum + Number(item.price ?? 0) * Number(item.quantity ?? 0);
    }, 0);
    setOrderAmount(total);
  }, [orderList]);

  useEffect(() => {
    const paymentAmount = Math.max(
      0,
      Number(orderAmount ?? 0) +
        Number(deliveryPrice ?? 0) -
        Number(usedPoint ?? 0),
    );
    setFinalPrice(paymentAmount);
  }, [orderAmount, deliveryPrice, usedPoint]);

  useEffect(() => {
    const checkNaver = setInterval(() => {
      if (window.naver && window.naver.maps && mapElement.current) {
        setMapLoaded(true);
        clearInterval(checkNaver);
      }
    }, 100);
    return () => clearInterval(checkNaver);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapElement.current) return;
    const { naver } = window;
    const location = new naver.maps.LatLng(STORE_INFO.lat, STORE_INFO.lng);
    try {
      const map = new naver.maps.Map(mapElement.current, {
        center: location,
        zoom: 17,
        zoomControl: true,
      });
      new naver.maps.Marker({
        position: location,
        map,
        icon: {
          content: `<div style="background:#1a1a2e; color:#fff; border-radius:50% 50% 50% 0; transform:rotate(-45deg); width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 2px 8px rgba(0,0,0,0.3);"><span style="transform:rotate(45deg)">🍽️</span></div>`,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40),
        },
      });
    } catch (e) {
      console.error("지도 생성 중 에러:", e);
    }
  }, [mapLoaded]);

  const isPickup = deliveryType === 1;

  const getStatusMessage = (status, isPickup) => {
    if (status === 9) return "주문이 아쉽게도 취소되었습니다.";
    if (status === 0 || status === 1)
      return "주문이 전달되었습니다. 사장님의 수락을 기다리고 있어요!";
    if (status === 2)
      return "사장님이 주문을 확인했습니다. 곧 조리가 시작됩니다.";
    if (status === 3)
      return "맛있게 음식을 조리하고 있습니다. 조금만 기다려주세요 🍳";
    if (status === 4) {
      return isPickup
        ? "음식이 준비되었습니다! 매장으로 방문해 주세요 🏃‍♂️"
        : "기사님이 배달을 출발했습니다! 곧 도착합니다 🛵";
    }
    if (status === 5) {
      return isPickup
        ? "픽업이 완료되었습니다. 맛있게 드세요! 😋"
        : "배달이 완료되었습니다. 맛있게 드세요! 😋";
    }
    return "주문 상태를 확인하고 있습니다.";
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.completeCard}>
          <div
            className={styles.completeIcon}
            style={{ backgroundColor: rawOrderStatus === 9 ? "#ff4757" : "" }}
          >
            {rawOrderStatus === 9 ? "✕" : "✓"}
          </div>

          <h1 className={styles.completeTitle}>
            {rawOrderStatus === 9
              ? "주문이 취소되었습니다."
              : "주문이 완료되었습니다!"}
          </h1>

          <p className={styles.completeDesc}>
            {rawOrderStatus === 9
              ? "결제하신 금액은 카드사에 따라 영업일 기준 2~3일 내로 환불될 예정입니다."
              : isPickup
                ? "매장 방문 픽업을 선택해 주셔서 감사합니다."
                : "친환경 배달을 선택해 주셔서 감사합니다."}
          </p>

          <button
            className={styles.orderCheckBtn}
            onClick={() => navigate("/mypage/user/orderList")}
          >
            주문내역 확인
          </button>
          <p className={styles.orderNumber}>
            ECO-{orderDate ? orderDate.substring(0, 10).replace(/-/g, "") : ""}-
            {orderId}
          </p>
        </section>

        <section className={styles.statusCard}>
          <h2 className={styles.sectionTitle}>실시간 주문 현황</h2>

          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.max(0, Math.min(100, (orderState / 3) * 100))}%`,
                }}
              >
                <span className={styles.seed}>🌱</span>
              </div>
            </div>

            <div className={styles.progressSteps}>
              {[
                "주문 접수",
                "조리중",
                isPickup ? "픽업 대기" : "배달중",
                isPickup ? "픽업 완료" : "배달 완료",
              ].map((label, index) => (
                <div key={index} className={styles.step}>
                  <div
                    className={`${styles.circle} ${
                      orderState >= index ? styles.active : ""
                    }`}
                  />
                  <p
                    className={
                      orderState >= index ? styles.labelActive : styles.label
                    }
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.statusMessage}>
            {getStatusMessage(rawOrderStatus, isPickup)}
          </p>
        </section>

        <div className={styles.bottomSection}>
          <section className={styles.leftColumn}>
            <div className={styles.mapCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.smallIcon}></span>
                  <h3 className={styles.cardTitle}>
                    <span>가게 위치</span> &gt;{" "}
                    <span className={styles.subtitle}>{storeName}</span>
                  </h3>
                </div>
              </div>

              <div className={styles.mapBox}>
                <div className={styles.mapWrapper}>
                  {!mapLoaded && (
                    <div className={styles.mapLoading}>
                      지도를 불러오는 중입니다...
                    </div>
                  )}
                  <div ref={mapElement} className={styles.map} />
                </div>
              </div>

              <div className={styles.arrivalRow}>
                <div className={styles.arrivalLeft}>
                  {/* 🌟 완료 시 아이콘에도 불이 들어오도록 필터 효과 추가 */}
                  <span
                    className={styles.smallIcon}
                    style={{
                      backgroundColor:
                        rawOrderStatus === 5 ? "#2f8f46" : "#ccc",
                      boxShadow:
                        rawOrderStatus === 5
                          ? "0 0 8px rgba(47, 143, 70, 0.6)"
                          : "none",
                    }}
                  ></span>

                  <span
                    style={{
                      color: rawOrderStatus === 5 ? "#2f8f46" : "#333",
                      fontWeight: rawOrderStatus === 5 ? "bold" : "500",
                      textShadow:
                        rawOrderStatus === 5
                          ? "0 0 5px rgba(47, 143, 70, 0.3)"
                          : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {rawOrderStatus === 5
                      ? isPickup
                        ? "픽업 완료 시간"
                        : "배달 완료 시간"
                      : isPickup
                        ? "픽업 예정 시간"
                        : "도착 예정 시간"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <strong className={styles.arrivalTime}>
                    {rawOrderStatus === 9 ? "--:--" : targetArrivalTime}
                  </strong>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#ff4757",
                      marginTop: "2px",
                    }}
                  >
                    {remainingTimeText}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.rightColumn}>
            <div className={styles.orderInfoCard}>
              <h3 className={styles.rightTitle}>주문 내역</h3>

              {orderDate && (
                <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                  주문 일시 : {orderDate}
                </p>
              )}
              {confirmDate && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#2f8f46",
                    fontWeight: "bold",
                    margin: "5px 0",
                  }}
                >
                  주문 승인 : {confirmDate}
                </p>
              )}

              <div className={styles.orderList}>
                <OrderListMap orderList={orderList} />
                <div className={styles.orderRow}>
                  <span>상품 금액</span>
                  <span>{orderAmount.toLocaleString()} 원</span>
                </div>
                <div className={styles.orderRow}>
                  <span>{isPickup ? "포장 / 픽업" : "에코 딜리버리"}</span>
                  <span>{deliveryPrice.toLocaleString()} 원</span>
                </div>
                <div className={styles.orderRow}>
                  <span>에코포인트 사용</span>
                  <span>- {usedPoint.toLocaleString()} 원</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span>총 결제 금액</span>
                <strong
                  style={{
                    color: rawOrderStatus === 9 ? "#999" : "",
                    textDecoration:
                      rawOrderStatus === 9 ? "line-through" : "none",
                  }}
                >
                  {finalPrice.toLocaleString()} 원
                </strong>
              </div>
            </div>

            <div className={styles.ecoCard}>
              <div className={styles.ecoHeader}>
                <span className={styles.smallIcon}></span>
                <h3 className={styles.rightTitle}>환경 기여도</h3>
              </div>
              <div className={styles.ecoInnerBox}>
                <p className={styles.ecoInnerTitle}>
                  이번 주문으로 절감한 탄소
                </p>
                <strong className={styles.ecoValue}>{getPoint}g</strong>
                <p className={styles.ecoInnerDesc}>
                  이번 주문으로 나무 가지 하나를 피웠습니다!
                </p>
              </div>
              <div className={styles.ecoInfoRow}>
                <span>에코 포인트 적립</span>
                <strong>+{getPoint.toLocaleString()}p</strong>
              </div>
              <div className={styles.ecoInfoRow}>
                <span>누적 탄소 절감량</span>
                <strong>
                  {totalCarbon ? totalCarbon.toLocaleString() : "0"}kg
                </strong>
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={() => navigate("/mypage/user/orderList")}
            >
              주문 목록 보기
            </button>

            {(rawOrderStatus === 0 || rawOrderStatus === 1) && (
              <button className={styles.secondaryBtn} onClick={cancelOrder}>
                주문 취소
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

const OrderListMap = ({ orderList }) => {
  return orderList.map((cart, index) => (
    <OrderItemList key={`orderList-${index}`} cart={cart} />
  ));
};

const OrderItemList = ({ cart }) => {
  return (
    <div>
      <div className={`${styles.orderRow} ${styles.order_price}`}>
        <span>
          {cart.menuName} * {cart.quantity}
        </span>
        <span>{(cart.price * cart.quantity).toLocaleString()}원</span>
      </div>
      {cart.optionString && (
        <p className={styles.option_list}>{cart.optionString}</p>
      )}
    </div>
  );
};
