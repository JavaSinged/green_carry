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
              <span className={styles.label}>{item.label}</span>
              <span className={styles.percent}>{item.percent}%</span>
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
