import React, { useEffect, useState } from "react"; // useState 추가
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

const OrderPage = () => {
  // 선택 상태 관리 (기본값: 'pickup')
  const [selectedRide, setSelectedRide] = useState("pickup");
  const [count, setCount] = useState(1);
  const [count1, setCount1] = useState(1);
  const navigate = useNavigate();
  const list = useLocation();
  const cartList = useCartStore((state) => state.cart);
  const storeId = useCartStore((state) => state.storeId);
  const [realTotal, setRealTotal] = useState(0);
  const [deliveryType, setDeliveryType] = useState(1);
  const [num, setNum] = useState(0);
  const setSuperTotalPrice = useCartStore((state) => state.setSuperTotalPrice);
  const setDeilveryPrice = useCartStore((state) => state.setDeilveryPrice);
  const totalCarbon = cartList.reduce((sum, item) => sum + item.carbonSaved, 0);
  const storeName = useCartStore((state) => state.storeName);
  useEffect(() => {
    setNum(deliveryType === 1 ? 0 : deliveryType === 2 ? 1000 : 3000);
  }, [deliveryType]);

  const addOrder = () => {};
  console.log(storeId);
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <section className={styles.leftSection}>
          <div className={styles.card}>
            <div className={styles.cardsHeader}>
              <h2
                onClick={() => {
                  navigate("/storeView");
                }}
              >
                <u>{storeName}</u> <NavigateNextIcon />
              </h2>
              <CloseIcon
                onClick={() => {
                  navigate("/storeView");
                }}
              />
            </div>
            <MenuList className={styles.manuList} changeTotal={setRealTotal} />
          </div>
          <div className={styles.totalPriceText}>
            <u>
              총 결제금액 <tr></tr>
              {(realTotal + num).toLocaleString()}원
            </u>
          </div>
        </section>

        <section className={styles.rightSection}>
          <div className={styles.card_ride}>
            <h3>배달방식</h3>

            {/* 1. 픽업 카드 */}
            <div
              className={`${styles.miniCard} ${selectedRide === "pickup" ? styles.selected : ""}`}
              onClick={() => {
                (setSelectedRide("pickup"), setDeliveryType(1));
              }}
            >
              <DirectionsRunIcon />
              <p>픽업</p>
              <p className={styles.feeText}>배달비 0원</p>
              <div className={styles.carbonBadge}>
                <p>🌱1km당 탄소 -150g</p>
              </div>
            </div>

            {/* 2. 도보 / 자전거 카드 */}
            <div
              className={`${styles.miniCard} ${selectedRide === "bike" ? styles.selected : ""}`}
              onClick={() => {
                (setSelectedRide("bike"), setDeliveryType(2));
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

            {/* 3. 오토바이 카드 */}
            <div
              className={`${styles.miniCard} ${selectedRide === "moto" ? styles.selected : ""}`}
              onClick={() => {
                (setSelectedRide("moto"), setDeliveryType(3));
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
                  <span>{totalCarbon + (deliveryType === 3 ? 0 : 300)}g</span>
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
              (addOrder(),
                setSuperTotalPrice(realTotal),
                setDeilveryPrice(num),
                navigate("/paymentPage"));
            }}
          >
            결제하기
          </div>
        </section>
      </main>
    </div>
  );
};

const MenuList = ({ changeTotal }) => {
  const handleTotal = (price) => {
    changeTotal(price);
  };
  const cartList = useCartStore((state) => state.cart);
  const totalPrice = cartList.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  useEffect(() => {
    changeTotal(totalPrice);
  }, [totalPrice]);
  const { increaseQuantity, decreaseQuantity } = useCartStore();
  if (cartList !== null) {
    return cartList.map((cart) => {
      return (
        <CartItem
          key={`cartList-${cartList.length}`}
          cart={cart}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
          handleTotal={handleTotal}
        />
      );
    });
  }
};
export default OrderPage;

const CartItem = ({
  cart,
  increaseQuantity,
  decreaseQuantity,
  handleTotal,
}) => {
  const unitPrice = cart.unitPrice;
  const totalPrice = unitPrice * cart.quantity;
  const options = cart.options;
  useEffect(() => {
    handleTotal(totalPrice);
  }, [totalPrice]);
  return (
    <div className={styles.menuList}>
      <div className={styles.menuItem}>
        <div className={styles.menuInfo}>
          <p>
            메뉴 : {cart.name} * ({cart.quantity})
          </p>
          <p>가격 :{unitPrice.toLocaleString()}원</p>
          <p className={styles.options}>
            옵션 :
            {options.map((option) => {
              const name = option.optionName;
              return <span>&nbsp;{name},&nbsp;</span>;
            })}
          </p>
          <div className={styles.quantityBox}>
            <button onClick={() => decreaseQuantity(cart.id)}>-</button>
            <span>{cart.quantity}</span>
            <button onClick={() => increaseQuantity(cart.id)}>+</button>
          </div>

          <p>메뉴 가격 : {totalPrice.toLocaleString()}원</p>
        </div>

        <div className={styles.menuImageWrapper}>
          <div className={styles.menuImagePlaceholder}></div>
          <span>[메뉴사진넣기]</span>
        </div>
      </div>
    </div>
  );
};
