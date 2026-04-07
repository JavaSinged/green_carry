import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const ReviewStatsChart = ({ data }) => {
  const options = {
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 0,
        donut: {
          size: "60%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "#666",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
              offsetY: 10,
              formatter: (val) => val.toLocaleString() + "건",
            },
            total: {
              show: true,
              showAlways: true,
              label: "리뷰 개수",
              fontSize: "14px",
              color: "#666",
              formatter: () => data.totalCount + "건",
            },
          },
        },
      },
    },
    // 이미지의 평점별 색상 적용: 진그린, 오렌지, 연두, 청록
    colors: ["#2e8147", "#ffb300", "#c0e0b0", "#008080"],
    labels: ["5점", "4점", "3점", "1점"],
    legend: { show: false }, // 범례는 커스텀 구현
    dataLabels: { enabled: false },
  };

  return (
    /* ❌ 인라인 스타일(style={{ paddingBottom: "10px" }}) 제거 */
    /* ✅ 오른쪽 단독 카드이므로자체 테두리와 배경(styles.chartCard)은 유지합니다. */
    <div className={styles.chartContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>리뷰 통계</span>
        <button className={styles.viewMoreBtn}>
          View more
          {/* MUI 아이콘 사용 권장 */}
          <OpenInNewIcon style={{ fontSize: "1rem", marginLeft: "4px" }} />
        </button>
      </div>

      <div className={styles.mainValue}>
        {data.totalCount}건
        <span className={styles.changePercent}>
          ↑ {data.changePercent}% 지난 주보다
        </span>
      </div>
      <Chart options={options} series={data.series} type="donut" height={220} />

      <div className={styles.legendContainer}>
        {options.labels.map((label, index) => (
          <div key={label} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: options.colors[index] }}
            ></span>
            <span className={styles.legendLabel}>{label}</span>
            <span className={styles.legendValue}>{data.series[index]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStatsChart;
