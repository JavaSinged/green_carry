import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const OrderStatsChart = ({ data }) => {
  const options = {
    chart: {
      type: "donut", // 차트 종류를 donut으로 설정
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%", // 도넛의 두께 (중앙 빈 공간 크기, 이미지처럼 적절히 크게)
          labels: {
            show: true, // 중앙에 데이터를 표시 (이미지처럼)
            name: {
              show: true,
              fontSize: "14px",
              color: "#666",
              offsetY: -10, // 텍스트 위치 조정
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
              offsetY: 10, // 숫자 위치 조정
              formatter: (val) => val.toLocaleString() + "원", // 금액 형식으로 변환
            },
            total: {
              show: true,
              showAlways: true, // 데이터를 하나만 선택해도 총합 표시 유지
              label: "당월 주문 금액", // 중앙 상단 텍스트 (이미지 그대로)
              fontSize: "14px",
              color: "#666",
              formatter: () => data.totalAmount.toLocaleString() + "원", // 중앙 하단 숫자 (이미지 그대로)
            },
          },
        },
      },
    },

    colors: ["#ffb300", "#2e8147", "#c0e0b0"],
    labels: ["포장", "도보 & 자전거", "오토바이"],
    dataLabels: {
      enabled: false, // 차트 조각 위에 데이터를 직접 표시하지 않음 (이미지처럼)
    },
    legend: {
      show: false, // 범례 숨기기 (이미지처럼)
    },
    stroke: {
      show: true, // 조각 사이의 간격
      width: 2,
      colors: ["#ffffff"],
    },
  };

  //임시 데이터
  const tempSeries = [35, 55, 15];

  return (
    <div className={styles.chartContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>주문 통계</span>
        <button className={styles.viewMoreBtn}>
          View more
          <OpenInNewIcon style={{ fontSize: "1rem", marginLeft: "4px" }} />
        </button>
      </div>

      <div className={styles.mainValue}>
        {data.totalAmount.toLocaleString()}원
      </div>

      {/* 차트 타입을 donut으로 명시하고 height를 적절히 조절 */}
      <Chart options={options} series={tempSeries} type="donut" height={350} />
    </div>
  );
};

export default OrderStatsChart;
