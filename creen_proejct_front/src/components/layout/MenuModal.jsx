import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./MenuModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import useCartStore from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";

export default function MenuModal({ isOpen, onClose, menuData }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [optionList, setOptionList] = useState([]); // 서버에서 받은 전체 옵션
  const [selectedOptions, setSelectedOptions] = useState([]); // 유저가 선택한 옵션 객체 배열

  const navigate = useNavigate();

  // ✅ 모달이 열릴 때마다 옵션 초기화
  useEffect(() => {
    if (isOpen && menuData?.menuId) {
      setQuantity(1);
      setSelectedOptions([]); // 선택 초기화

      axios
        .get(
          `${import.meta.env.VITE_BACKSERVER}/stores/${menuData.menuId}/options`,
        )
        .then((res) => {
          console.log("옵션 데이터:", res.data);
          const fetchedOptions = res.data;
          setOptionList(fetchedOptions);

          // 💡 Type 1(사이즈)가 있다면 첫 번째 값을 기본 선택으로 설정
          const defaultSize = fetchedOptions.find((o) => o.optionType === 1);
          if (defaultSize) {
            setSelectedOptions([defaultSize]);
          }
        })
        .catch((err) => console.error("옵션 로딩 실패:", err));
    }
  }, [isOpen, menuData]);

  // 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen || !menuData) return null;

  // ✅ 옵션 선택 핸들러 (라디오 & 체크박스 통합)
  const handleOptionToggle = (option) => {
    if (option.optionType === 1) {
      // Type 1(사이즈/필수)일 경우: 기존 Type 1을 지우고 새로 클릭한 걸 넣음 (단일 선택)
      const filtered = selectedOptions.filter((o) => o.optionType !== 1);
      setSelectedOptions([...filtered, option]);
    } else {
      // Type 2, 3(추가, 에코)일 경우: 체크박스 토글 (다중 선택)
      const isExist = selectedOptions.find(
        (o) => o.optionNo === option.optionNo,
      );
      if (isExist) {
        setSelectedOptions(
          selectedOptions.filter((o) => o.optionNo !== option.optionNo),
        );
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    }
  };

  // ✅ 가격 및 탄소 배출량 계산 로직
  // 1. 선택된 옵션들의 가격 총합
  const optionsPriceSum = selectedOptions.reduce(
    (sum, opt) => sum + opt.optionPrice,
    0,
  );
  const unitPrice = menuData.menuPrice + optionsPriceSum;
  const totalPrice = unitPrice * quantity;

  // 탄소 계산 (다회용 용기 사용 시 15g 감소)
  const baseCarbonG = menuData.carbonPer100g ?? 100;
  const carbonTotal =
    (reusable
      ? Math.max(0, baseCarbonG - 15) * quantity
      : baseCarbonG * quantity) -
    (ecoSide ? 10 : 0) -
    (ecoDisposable ? 10 : 0);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now(),
      menuId: menuData.menuId,
      name: menuData.menuName,
      quantity,
      totalPrice,

      unitPrice,
      carbonSaved:
        (reusable ? 15 * quantity : 0) +
        (ecoSide ? 10 : 0) +
        (ecoDisposable ? 10 : 0),
    };
    addToCart(cartItem);

    onClose();
  };

  // 💡 화면 렌더링을 위해 서버 데이터를 Type별로 분리
  const sizeOptions = optionList.filter((o) => o.optionType === 1);
  const addOnOptions = optionList.filter((o) => o.optionType === 2);
  const ecoOptions = optionList.filter((o) => o.optionType === 3);

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div
        className={styles.modal_content}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={styles.header}>
          <h2>메뉴 상세</h2>
          <CloseIcon className={styles.close_btn} onClick={onClose} />
        </div>

        {/* 본문 */}
        <div className={styles.body}>
          <div className={styles.image_placeholder}>
            {menuData.menuImage && (
              <img
                src={menuData.menuImage}
                alt="메뉴"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          <div className={styles.menu_info}>
            <h3>{menuData.menuName}</h3>
            <p className={styles.desc}>{menuData.menuInfo}</p>
            <p className={styles.price}>
              {menuData.menuPrice.toLocaleString()}원
            </p>
          </div>

          <hr className={styles.divider} />

          {/* 1️⃣ 사이즈 선택 (라디오 버튼) */}
          {sizeOptions.length > 0 && (
            <div className={styles.option_section}>
              <h4>사이즈 선택</h4>
              {sizeOptions.map((opt) => (
                <label
                  key={opt.optionNo}
                  className={`${styles.option_row} ${selectedOptions.find((o) => o.optionNo === opt.optionNo) ? styles.selected : ""}`}
                >
                  <input
                    type="radio"
                    name="size"
                    checked={
                      !!selectedOptions.find((o) => o.optionNo === opt.optionNo)
                    }
                    onChange={() => handleOptionToggle(opt)}
                  />
                  <span>{opt.optionName}</span>
                  <span className={styles.price_diff}>
                    {opt.optionPrice > 0
                      ? `+${opt.optionPrice.toLocaleString()}원`
                      : opt.optionPrice < 0
                        ? `${opt.optionPrice.toLocaleString()}원`
                        : "기본"}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* 2️⃣ 추가 토핑 (체크박스) */}
          {addOnOptions.length > 0 && (
            <div className={styles.option_section}>
              <h4>추가 선택</h4>
              {addOnOptions.map((opt) => (
                <label
                  key={opt.optionNo}
                  className={`${styles.option_row} ${selectedOptions.find((o) => o.optionNo === opt.optionNo) ? styles.selected : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={
                      !!selectedOptions.find((o) => o.optionNo === opt.optionNo)
                    }
                    onChange={() => handleOptionToggle(opt)}
                  />
                  <span>{opt.optionName}</span>
                  <span className={styles.price_diff}>
                    +{opt.optionPrice.toLocaleString()}원
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* 3️⃣ 오늘도 그린하게 🌱 (체크박스) */}
          {ecoOptions.length > 0 && (
            <div className={styles.option_section}>
              <h4>오늘도 그린하게 🌱</h4>
              {ecoOptions.map((opt) => (
                <label
                  key={opt.optionNo}
                  className={`${styles.option_row} ${selectedOptions.find((o) => o.optionNo === opt.optionNo) ? styles.selected : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={
                      !!selectedOptions.find((o) => o.optionNo === opt.optionNo)
                    }
                    onChange={() => handleOptionToggle(opt)}
                  />
                  <span>{opt.optionName}</span>
                  {/* 에코 포인트는 임시로 20P 고정, 다회용기는 가격(500원 등) 표시 */}
                  <span
                    className={
                      opt.optionName.includes("다회용")
                        ? styles.price_diff
                        : styles.eco_point
                    }
                  >
                    {opt.optionPrice > 0
                      ? `+${opt.optionPrice.toLocaleString()}원`
                      : "+20P"}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          <div className={styles.summary_row}>
            <span className={styles.summary_label}>수량</span>
            <div className={styles.quantity_control}>
              <RemoveIcon
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={styles.q_btn}
              />
              <span>{quantity}</span>
              <AddIcon
                onClick={() => setQuantity(quantity + 1)}
                className={styles.q_btn}
              />
            </div>
          </div>
          <div className={styles.summary_row}>
            <span className={styles.summary_label}>총 예상 탄소 배출</span>
            <span className={styles.carbon_total}>{carbonTotal}g CO2e</span>
          </div>
          <button className={styles.submit_btn} onClick={handleAddToCart}>
            {totalPrice.toLocaleString()}원 담기
          </button>
        </div>
      </div>
    </div>
  );
}
