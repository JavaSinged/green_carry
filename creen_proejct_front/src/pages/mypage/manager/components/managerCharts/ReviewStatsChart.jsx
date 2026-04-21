import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

const ReviewStatsChart = ({ data }) => {
  const navigate = useNavigate();

  // 데이터가 아직 로드되지 않았을 때를 위한 방어 코드
  if (!data || !data.series) {
    return <div className={styles.loading}>차트 데이터를 불러오는 중...</div>;
  }

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
              formatter: (val) => (val ? val.toLocaleString() + "%" : "0%"),
            },
            total: {
              show: true,
              showAlways: true,
              label: "평균 별점", // 🌟 리뷰 개수 대신 평균 점수를 보여주면 더 직관적입니다.
              fontSize: "14px",
              color: "#666",
              formatter: () =>
                data.avgRating ? data.avgRating.toFixed(1) + "점" : "0점",
            },
          },
        },
      },
    },
    // 🌟 색상을 5개로 맞췄습니다 (5점 -> 1점 순서)
    colors: [
      "var(--color-brand)", // 5점 (진한 초록)
      "#81c784", // 4점 (연한 초록)
      "#ffb300", // 3점 (노란색)
      "#ff8a65", // 2점 (주황색)
      "#e57373", // 1점 (빨간색 계열) - 이제 1점이 잘 보일 거예요!
    ],
    labels: ["5점", "4점", "3점", "2점", "1점"],
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>리뷰 통계</span>
        <button
          className={styles.viewMoreBtn}
          onClick={() => {
            navigate("/mypage/manager/reviews");
          }}
        >
          View more
          <OpenInNewIcon style={{ fontSize: "1rem", marginLeft: "4px" }} />
        </button>
      </div>

      <div className={styles.mainValue}>
        {data.avgRating?.toFixed(1)}점
        <span className={styles.review_count_sub}>
          (총 {data.totalCount}건)
        </span>
        {data.changePercent > 0 && (
          <span className={styles.changePercent}>
            ↑ {data.changePercent}% 지난 주보다
          </span>
        )}
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
            {/* 🌟 데이터가 없을 경우를 대비해 0 표시 */}
            <span className={styles.legendValue}>
              {data.series[index] || 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStatsChart;
