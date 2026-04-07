import React, { useEffect, useRef, useState } from "react";
import styles from "./CheckoutPage.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import axios from "axios";
import Swal from "sweetalert2";

const CheckoutPage = () => {
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
  const [orderAmount, setOrderAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const params = new URLSearchParams(location.search);
  const paymentOrderId = params.get("orderId");
  const orderId = paymentOrderId ? Number(paymentOrderId.split("_")[1]) : null;
  const [storeName, setStoreName] = useState("");

  // 상태 관리를 위한 State
  const [orderState, setOrderState] = useState(0); // UI 프로그레스바용
  const [rawOrderStatus, setRawOrderStatus] = useState(0); // 실제 백엔드 상태(0~9) 저장용
  const [orderDate, setOrderDate] = useState("");
  const [totalCarbon, setTotalCarbon] = useState(0);

  // 배달 타입 상태 추가 (1: 픽업, 2/3: 배달)
  const [deliveryType, setDeliveryType] = useState(0);

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

        // 배달 방식 저장
        setDeliveryType(res.data.deliveryType ?? 0);

        setRawOrderStatus(res.data.orderStatus ?? 0);
        setOrderState((res.data.orderStatus ?? 2) - 2);
        setOrderDate(res.data.orderDate);
        setTotalCarbon(res.data.totalReduceCarbon);
      })
      .catch((err) => {
        console.error("주문 정보 갱신 실패:", err);
      });
  };

  useEffect(() => {
    fetchOrderDetails();

    const intervalId = setInterval(() => {
      fetchOrderDetails();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [orderId]);

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
        minZoom: 10,
      });

      new naver.maps.Marker({
        position: location,
        map,
        icon: {
          content: `<div style="
              background:#1a1a2e;
              color:#fff;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              width:40px; height:40px;
              display:flex; align-items:center; justify-content:center;
              font-size:18px; box-shadow:0 2px 8px rgba(0,0,0,0.3);
            "><span style="transform:rotate(45deg)">🍽️</span></div>`,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40),
        },
      });
    } catch (e) {
      console.error("지도 생성 중 에러:", e);
    }
  }, [mapLoaded]);

  // 픽업 여부 변수 (1이면 픽업)
  const isPickup = deliveryType === 1;

  // 🌟 [추가] 상태별로 안내 메시지를 반환하는 함수
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
          <div className={styles.completeIcon}>✓</div>
          <h1 className={styles.completeTitle}>주문이 완료되었습니다!</h1>
          <p className={styles.completeDesc}>
            {isPickup
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
            ECO-{orderDate ? orderDate.replace(/-/g, "") : ""}-{orderId}
          </p>
        </section>

        <section className={styles.statusCard}>
          <h2 className={styles.sectionTitle}>실시간 주문 현황</h2>

          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(orderState / 3) * 100}%` }}
              >
                <span className={styles.seed}>🌱</span>
              </div>

              <div className={styles.progressWrapper}></div>
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
            {/* 🌟 [수정] 안내 메시지 함수 적용 */}
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
                  <span className={styles.smallIcon}></span>
                  <span>{isPickup ? "픽업 예정 시간" : "도착 예정 시간"}</span>
                </div>
                <strong className={styles.arrivalTime}>19:35</strong>
              </div>
            </div>
          </section>

          <aside className={styles.rightColumn}>
            <div className={styles.orderInfoCard}>
              <h3 className={styles.rightTitle}>주문 내역</h3>

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
                <strong>{finalPrice.toLocaleString()} 원</strong>
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
                <strong>{totalCarbon}kg</strong>
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={() => {
                navigate("/mypage/user/orderList");
              }}
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
  return orderList.map((cart, index) => {
    return <OrderItemList key={`orderList-${index}`} cart={cart} />;
  });
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

      {cart.optionString && cart.optionString !== "" ? (
        <p className={styles.option_list}>{cart.optionString}</p>
      ) : (
        ""
      )}
    </div>
  );
};
