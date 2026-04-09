import React, { useEffect, useState } from "react";
import styles from "./OrderPage.module.css";
import Header from "../../components/commons/Header";
import Footer from "../../components/commons/Footer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ParkIcon from "@mui/icons-material/Park";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import axios from "axios";

const OrderPage = () => {
  const navigate = useNavigate();

  // 🌟 Zustand 스토어 데이터 추출
  const cartList = useCartStore((state) => state.cart);
  const storeId = useCartStore((state) => state.storeId);
  const storeName = useCartStore((state) => state.storeName);
  const setSuperTotalPrice = useCartStore((state) => state.setSuperTotalPrice);
  const setDeilveryPrice = useCartStore((state) => state.setDeilveryPrice);
  const { increaseQuantity, decreaseQuantity } = useCartStore();

  // 상태 관리
  const [selectedRide, setSelectedRide] = useState("pickup");
  const [realTotal, setRealTotal] = useState(0);
  const [deliveryType, setDeliveryType] = useState(1);
  const [num, setNum] = useState(0);

  // 장바구니 비어있음 여부 체크
  const isCartEmpty = !cartList || cartList.length === 0;

  // 탄소 절감량 계산
  const totalCarbon = Math.floor(
    cartList.reduce((sum, item) => sum + item.totalCarbon, 0),
  );

  useEffect(() => {
    setNum(deliveryType === 1 ? 0 : deliveryType === 2 ? 1000 : 3000);
  }, [deliveryType]);

  const addOrder = () => {
    // 주문 추가 로직
  };

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        {isCartEmpty ? (
          /* 🌟 장바구니가 비었을 때 보여줄 화면 */
          <section className={styles.emptySection}>
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>🛒</div>
              <h2>장바구니가 비어있습니다</h2>
              <p>맛있는 음식을 담으러 가볼까요?</p>
              <button
                className={styles.goHomeButton}
                onClick={() => navigate("/")}
              >
                홈으로 가기
              </button>
            </div>
          </section>
        ) : (
          /* 🌟 장바구니에 물건이 있을 때만 출력되는 영역 */
          <>
            <section className={styles.leftSection}>
              <div className={styles.card}>
                <div className={styles.cardsHeader}>
                  <h2
                    onClick={() => navigate(`/storeView/${storeId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <u>{storeName}</u> <NavigateNextIcon />
                  </h2>
                  <CloseIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/storeView/${storeId}`)}
                  />
                </div>
                {/* 메뉴 리스트 영역 */}
                <MenuList
                  cartList={cartList}
                  changeTotal={setRealTotal}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                />
              </div>
              <div className={styles.totalPriceText}>
                <u>
                  총 결제금액 <br />
                  {(realTotal + num).toLocaleString()}원
                </u>
              </div>
            </section>

            <section className={styles.rightSection}>
              <div className={styles.card_ride}>
                <h3>배달방식</h3>

                <div
                  className={`${styles.miniCard} ${selectedRide === "pickup" ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedRide("pickup");
                    setDeliveryType(1);
                  }}
                >
                  <DirectionsRunIcon />
                  <p>픽업</p>
                  <p className={styles.feeText}>배달비 0원</p>
                  <div className={styles.carbonBadge}>
                    <p>🌱1km당 탄소 -150g</p>
                  </div>
                </div>

                <div
                  className={`${styles.miniCard} ${selectedRide === "bike" ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedRide("bike");
                    setDeliveryType(2);
                  }}
                >
                  <DirectionsBikeIcon />
                  <p>도보 / 자전거</p>
                  <p className={styles.feeText}>1,000원</p>
                  <span>예상 배달 시간 30분</span>
                  <div className={styles.carbonBadge}>
                    <p>🌱1km당 탄소 -150g</p>
                  </div>
                </div>

                <div
                  className={`${styles.miniCard} ${selectedRide === "moto" ? styles.selected : ""}`}
                  onClick={() => {
                    setSelectedRide("moto");
                    setDeliveryType(3);
                  }}
                >
                  <TwoWheelerIcon />
                  <p>오토바이</p>
                  <p className={styles.feeText}>3,000원</p>
                  <span>예상 배달 시간 25분</span>
                </div>

                <div className={styles.ecoInfoContainer}>
                  <div className={styles.ecoTitle}>
                    <ParkIcon />
                    <h4>에코 딜리버리 선택</h4>
                  </div>
                  <div className={styles.ecoList}>
                    <div className={styles.ecoItem}>
                      <span>이동 거리:</span>
                      <span>3km</span>
                    </div>
                    <div className={styles.ecoItem}>
                      <span>탄소 절감:</span>
                      <span>
                        {totalCarbon + (deliveryType === 3 ? 0 : 300)}g
                      </span>
                    </div>
                    <div className={styles.ecoItem}>
                      <span>적립 예정:</span>
                      <span>
                        {totalCarbon + (deliveryType === 3 ? 0 : 300)} 포인트
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={styles.payButton}
                onClick={() => {
                  addOrder();
                  setSuperTotalPrice(realTotal);
                  setDeilveryPrice(num);
                  navigate("/paymentPage");
                }}
              >
                결제하기
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

// MenuList 컴포넌트
const MenuList = ({
  cartList,
  changeTotal,
  increaseQuantity,
  decreaseQuantity,
}) => {
  const totalPrice = cartList.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  useEffect(() => {
    changeTotal(totalPrice);
  }, [totalPrice, changeTotal]);

  return cartList.map((cart) => (
    <CartItem
      key={cart.id}
      cart={cart}
      increaseQuantity={increaseQuantity}
      decreaseQuantity={decreaseQuantity}
    />
  ));
};

// CartItem 컴포넌트
const CartItem = ({ cart, increaseQuantity, decreaseQuantity }) => {
  const unitPrice = cart.unitPrice;
  const totalPrice = unitPrice * cart.quantity;
  const options = cart.options;
  const backHost = import.meta.env.VITE_BACKSERVER;
  const [fetchedImage, setFetchedImage] = useState("");

  useEffect(() => {
    if (cart.menuId) {
      axios
        .get(`${backHost}/stores/orders/itemImg/${cart.menuId}`)
        .then((res) => {
          if (res.data) {
            setFetchedImage(`${backHost}${res.data}`);
          }
        })
        .catch((err) => console.log("이미지 로드 에러:", err));
    }
  }, [cart.menuId, backHost]);

  return (
    <div className={styles.menuList}>
      <div className={styles.menuItem}>
        <div className={styles.menuInfo}>
          <p className={styles.menuNameTitle}>메뉴 : {cart.name}</p>
          <p>가격 : {unitPrice.toLocaleString()}원</p>
          <div className={styles.options}>
            옵션 :
            {options && options.length > 0
              ? options.map((option, index) => (
                  <span key={index}>
                    &nbsp;{option.optionName}
                    {index < options.length - 1 ? "," : ""}&nbsp;
                  </span>
                ))
              : " 없음"}
          </div>
          <div className={styles.quantityBox}>
            <button onClick={() => decreaseQuantity(cart.id)}>-</button>
            <span>{cart.quantity}</span>
            <button onClick={() => increaseQuantity(cart.id)}>+</button>
          </div>
          <p className={styles.itemTotal}>
            소계 : {totalPrice.toLocaleString()}원
          </p>
        </div>

        <div className={styles.menuImageWrapper}>
          <img
            src={
              fetchedImage ||
              (cart.menuImage
                ? `${backHost}${cart.menuImage}`
                : "https://via.placeholder.com/150?text=No+Image")
            }
            alt={cart.name}
            className={styles.menuImage}
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=No+Image";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
