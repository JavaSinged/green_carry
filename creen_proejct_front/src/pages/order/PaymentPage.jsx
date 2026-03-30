import React, { useState } from "react";
import styles from "./PaymentPage.module.css";
import RoomIcon from "@mui/icons-material/Room";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [storeRequest, setStoreRequest] = useState("");
  const [deliveryRequest, setDeliveryRequest] = useState("");
  const [ecoPoint, setEcoPoint] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [itemPrice, setItemPrice] = useState(45000);
  const [deliveryPrice, setDeliveryPrice] = useState(1000);
  const totalPrice = itemPrice + deliveryPrice - ecoPoint;
  const phone = /^010-\d{4}-\d{4}$/;

  return (
    <div className={styles["payment-page"]}>
      <main className={styles["payment-main"]}>
        <div className={styles["payment-top-text"]}>
          <button
            className={styles["back-btn"]}
            onClick={() => {
              navigate("/shoppingCart");
            }}
          >
            {" "}
            장바구니로 돌아가기
          </button>
          <p>주문 정보를 확인하고 결제를 완료하세요</p>
        </div>

        <div className={styles["payment-content"]}>
          {/* 왼쪽 영역 */}
          <section className={styles["payment-left"]}>
            <div className={styles["info-card"]}>
              <div className={styles["card-title-row"]}>
                <div className={styles["card-title-left"]}>
                  <RoomIcon />
                  <h2>배송정보</h2>
                </div>
                <button
                  className={styles["text-btn"]}
                  onClick={() => {
                    navigate("/changeAddr");
                  }}
                >
                  주소 변경
                </button>
              </div>

              <div className={styles["form-group"]}>
                <label>배송 주소</label>
                <input
                  type="text"
                  value="서울시 종로구 대왕빌딩 301"
                  readOnly
                />
              </div>

              <div className={styles["form-group"]}>
                <label>연락처</label>
                <input type="text" value="010-0000-0000" readOnly />
              </div>
            </div>

            <div className={styles["info-card"]}>
              <div className={styles["card-title-row"]}>
                <div className={styles["card-title-left"]}>
                  <ChatBubbleIcon></ChatBubbleIcon>
                  <h2>요청사항</h2>
                </div>
                <ExpandMoreIcon></ExpandMoreIcon>
              </div>

              <div className={styles["form-group"]}>
                <label>가게 요청사항</label>
                <input
                  type="text"
                  placeholder="요청사항을 선택해주세요"
                  value={storeRequest}
                  onChange={(e) => setStoreRequest(e.target.value)}
                />
              </div>

              <div className={styles["form-group"]}>
                <label>배달 요청사항</label>
                <div className={styles["select-wrap"]}>
                  <select
                    value={deliveryRequest}
                    onChange={(e) => setDeliveryRequest(e.target.value)}
                  >
                    <option value="">요청사항을 선택해주세요</option>
                    <option value="door">문 앞에 두고 가주세요</option>
                    <option value="call">도착 후 전화 주세요</option>
                    <option value="safe">경비실에 맡겨주세요</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles["info-card"]}>
              <div className={styles["card-title-row"]}>
                <div className={styles["card-title-left"]}>
                  <CardGiftcardIcon></CardGiftcardIcon>
                  <h2>에코 포인트 사용 및 적립</h2>
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label>에코 포인트 사용</label>
                <div className={styles["point-row"]}>
                  <input
                    type="text"
                    value={ecoPoint}
                    onChange={(e) => {
                      const value = e.target.value;

                      // 숫자만 허용
                      if (!/^[0-9]*$/.test(value)) return;

                      // 최대값 제한 (itemPrice)
                      if (Number(value) > itemPrice) return;

                      setEcoPoint(value);
                    }}
                  />
                  <button
                    className={styles["point-cancel-btn"]}
                    onClick={() => {
                      setEcoPoint(0);
                    }}
                  >
                    사용취소
                  </button>
                </div>
                <p className={styles["point-desc"]}>보유 : 7,000 점(원)</p>
              </div>

              <div className={styles["form-group"]}>
                <label>이번 주문으로 받을 에코포인트</label>
                <input type="text" value="450" readOnly />
              </div>
            </div>
          </section>

          {/* 오른쪽 */}
          <aside className={styles["payment-right"]}>
            <div className={styles["summary-card"]}>
              <h2 className={styles["summary-title"]}>결제 정보</h2>

              <div className={styles["price-list"]}>
                <div className={styles["price-row"]}>
                  <span>상품합계</span>
                  <span>{itemPrice}원</span>
                </div>
                <div className={styles["price-row"]}>
                  <span>배달비</span>
                  <span>{deliveryPrice}원</span>
                </div>
                <div className={styles["price-row"]}>
                  <span>에코포인트 사용</span>
                  <span>-{ecoPoint}P</span>
                </div>
              </div>

              <div className={styles["total-row"]}>
                <span>최종 결제 금액</span>
                <strong>{totalPrice}원</strong>
              </div>

              <div className={styles["carbon-card"]}>
                <p className={styles["carbon-title"]}>이 주문의 탄소 절감</p>
                <strong className={styles["carbon-value"]}>450g</strong>
                <p className={styles["carbon-desc"]}>
                  이번 주문으로 나무 가지 하나를 틔웠습니다!
                </p>
              </div>

              <button
                className={styles["pay-btn"]}
                onClick={() => {
                  navigate("/checkoutPage");
                }}
              >
                {totalPrice}원 결제하기
              </button>

              <p className={styles["pay-notice"]}>
                결제 진행 시 주문이 확정되며
                <br />
                취소는 가게 승인 전까지 가능합니다.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
