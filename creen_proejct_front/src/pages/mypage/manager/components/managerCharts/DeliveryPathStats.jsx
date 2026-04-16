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
              {/* 왼쪽: 백엔드에서 넘어온 라벨 + 주문 건수 */}
              <span className={styles.label}>
                {item.label}
                <span
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    fontWeight: "normal",
                    marginLeft: "6px",
                  }}
                >
                  ({item.orderCount || 0}건)
                </span>
              </span>

              {/* 오른쪽: 해당 방식의 총 금액 + 퍼센트 */}
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "10px" }}
              >
                <span style={{ fontSize: "0.9rem", color: "#555" }}>
                  {(item.seriesAmount || 0).toLocaleString()}원
                </span>
                <span className={styles.percent}>{item.percent}%</span>
              </div>
            </div>

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryPathStats;
