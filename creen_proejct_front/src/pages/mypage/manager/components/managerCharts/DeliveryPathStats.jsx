import React from "react";
import styles from "./managerChart.module.css";

const DeliveryPathStats = ({ data }) => {
  return (
    <div className={styles.chartContainer}>
      <div className={styles.progressBarContainer}>
        {/* 프로그레스 바 반복 부분 */}
        {data.map((item) => (
          <div key={item.type} className={styles.progressRow}>
            <div className={styles.labelValueGroup}>
              <div className={styles.progressLabel}>{item.type}</div>
              <div className={styles.progressValue}>{item.percent}%</div>
            </div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryPathStats;
