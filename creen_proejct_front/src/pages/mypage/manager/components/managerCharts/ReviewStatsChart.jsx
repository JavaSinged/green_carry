import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

const ReviewStatsChart = ({ data }) => {
  const navigate = useNavigate();

  if (!data || !data.series) {
    return <div className={styles.noData}>차트 데이터를 불러오는 중...</div>;
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
              label: "평균 별점",
              fontSize: "14px",
              color: "#666",
              formatter: () =>
                data.avgRating ? data.avgRating.toFixed(1) + "점" : "0점",
            },
          },
        },
      },
    },
    colors: ["var(--color-brand)", "#81c784", "#ffb300", "#ff8a65", "#e57373"],
    labels: ["5점", "4점", "3점", "2점", "1점"],
    legend: { show: false },
    dataLabels: { enabled: false },

    // 🌟 [수정됨] 형님 요청사항: 툴팁에 "5점 : (4건)" 형식으로 출력되도록 변경
    tooltip: {
      enabled: true,
      y: {
        title: {
          formatter: (seriesName) => `${seriesName} :`, // 라벨 뒤에 콜론 추가
        },
        formatter: (val, opts) => {
          // 백엔드에서 배열로 건수를 넘겨준다면 data.counts[opts.seriesIndex] 활용 가능
          if (data.counts && data.counts[opts.seriesIndex] !== undefined) {
            return `(${data.counts[opts.seriesIndex]}건)`;
          }
          // 퍼센트로 넘어올 경우 전체 건수에서 역산하여 건수 계산
          const calculatedCount = Math.round(
            (val / 100) * (data.totalCount || 0),
          );
          return `(${calculatedCount}건)`;
        },
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
        <span>{data.avgRating?.toFixed(1)}점</span>
        {/* CSS 파일에 없는 review_count_sub 클래스 대신 인라인 스타일로 통일 */}
        <span style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}>
          (총 {data.totalCount}건)
        </span>
        {data.changePercent > 0 && (
          <span className={styles.changePercent} style={{ marginLeft: "auto" }}>
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
