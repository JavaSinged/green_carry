import React, { useEffect, useRef, useState } from "react";
import styles from "./CheckoutPage.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
const CheckoutPage = () => {
  const cartList = useCartStore((state) => state.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const mapElement = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const STORE_INFO = { lat: 37.497952, lng: 127.027619 };
  const totalPrice = cartList.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCarbon = cartList.reduce((sum, item) => sum + item.carbonSaved, 0);

  const payInfo = location.state?.payInfo;
  console.log(payInfo);
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
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* 완료 카드 */}
        <section className={styles.completeCard}>
          <div className={styles.completeIcon}>✓</div>
          <h1 className={styles.completeTitle}>주문이 완료되었습니다!</h1>
          <p className={styles.completeDesc}>
            친환경 배달을 선택해 주셔서 감사합니다.
          </p>

          <button className={styles.orderCheckBtn}>주문내역 확인</button>
          <p className={styles.orderNumber}>ECO-2026-032501</p>
        </section>

        {/* 주문 현황 */}
        <section className={styles.statusCard}>
          <h2 className={styles.sectionTitle}>실시간 주문 현황</h2>

          <div className={styles.timeline}>
            <div className={styles.timelineLine}></div>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineCircle} ${styles.active}`}>
                <span className={styles.timelineIcon}></span>
              </div>
              <p className={styles.timelineLabelActive}>주문 접수</p>
              <span className={styles.timelineTime}>18:45</span>
            </div>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineCircle} ${styles.active}`}>
                <span className={styles.timelineIcon}></span>
              </div>
              <p className={styles.timelineLabelActive}>조리중</p>
              <span className={styles.timelineTime}>18:46</span>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineCircle}>
                <span className={styles.timelineIcon}></span>
              </div>
              <p className={styles.timelineLabel}>배달중</p>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineCircle}>
                <span className={styles.timelineIcon}></span>
              </div>
              <p className={styles.timelineLabel}>배달 완료</p>
            </div>
          </div>

          <p className={styles.statusMessage}>
            정성껏 음식을 준비하고 있습니다.
          </p>
        </section>

        {/* 하단 영역 */}
        <div className={styles.bottomSection}>
          {/* 왼쪽 */}
          <section className={styles.leftColumn}>
            <div className={styles.mapCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.smallIcon}></span>
                  <h3 className={styles.cardTitle}>
                    <span>가게 위치</span> &gt;{" "}
                    <span className={styles.subtitle}>
                      처갓집치킨 왕십리점
                    </span>{" "}
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
                  <span>도착 예정 시간</span>
                </div>
                <strong className={styles.arrivalTime}>19:35</strong>
              </div>
            </div>
          </section>

          {/* 오른쪽 */}
          <aside className={styles.rightColumn}>
            <div className={styles.orderInfoCard}>
              <h3 className={styles.rightTitle}>주문 내역</h3>

              <div className={styles.orderList}>
                <OrderListMap cartList={cartList} />
                <div className={styles.orderRow}>
                  <span>에코 딜리버리</span>
                  <span>{payInfo.deliveryPrice.toLocaleString()} 원</span>
                </div>
                <div className={styles.orderRow}>
                  <span>에코포인트 사용</span>
                  <span>- {payInfo.ecoPoint.toLocaleString()} 원</span>
                </div>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.totalRow}>
                <span>총 결제 금액</span>
                <strong>{totalPrice.toLocaleString()} 원</strong>
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
                <strong className={styles.ecoValue}>{totalCarbon}g</strong>
                <p className={styles.ecoInnerDesc}>
                  이번 주문으로 나무 가지 하나를 피웠습니다!
                </p>
              </div>

              <div className={styles.ecoInfoRow}>
                <span>에코 포인트 적립</span>
                <strong>+{totalCarbon.toLocaleString()}p</strong>
              </div>
              <div className={styles.ecoInfoRow}>
                <span>누적 탄소 절감량</span>
                <strong>24.6kg</strong>
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={() => {
                navigate("/");
              }}
            >
              주문 내역보기
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                navigate("/");
              }}
            >
              주문 취소
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

const OrderListMap = ({ cartList }) => {
  console.log(cartList);
  return cartList.map((cart, index) => {
    return <OrderItemList key={`cartList-${index}`} cart={cart} />;
  });
};
const OrderItemList = ({ cart }) => {
  return (
    <div>
      <div className={styles.orderRow}>
        <span>{cart.name}</span>
        <span>{(cart.unitPrice * cart.quantity).toLocaleString()}원</span>
      </div>
    </div>
  );
};
