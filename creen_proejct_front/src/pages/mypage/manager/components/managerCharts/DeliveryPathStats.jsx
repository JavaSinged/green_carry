import React from "react";
import styles from "./managerChart.module.css";

const DeliveryPathStats = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className={styles.noData}>데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.pathWrap}>
      <div className={styles.list}>
        {data.map((item) => (
          <div className={styles.item} key={item.deliveryType}>
            <div className={styles.info}>
              {/* 왼쪽: 라벨 + 주문 건수 (항상 노출) */}
              <span className={styles.label}>
                {item.label}
                <span className={styles.orderCount}>
                  ({item.orderCount || 0}건)
                </span>
              </span>

              {/* 오른쪽: 퍼센트 (항상 노출) */}
              <div className={styles.percentArea}>
                <span className={styles.percent}>{item.percent}%</span>
              </div>
            </div>

            {/* 바 영역: 마우스를 올리면 금액이 띄워짐 */}
            <div className={styles.barContainer}>
              <div className={styles.barBg}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor:
                      item.deliveryType === 1
                        ? "var(--color-point)"
                        : item.deliveryType === 2
                          ? "var(--color-brand)"
                          : "var(--color-info)",
                  }}
                />
              </div>

              {/* 🌟 마우스 호버 시 나타날 금액 툴팁 */}
              <div className={styles.amountTooltip}>
                {(item.seriesAmount || 0).toLocaleString()}원 (
                {item.orderCount || 0}건)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryPathStats;
