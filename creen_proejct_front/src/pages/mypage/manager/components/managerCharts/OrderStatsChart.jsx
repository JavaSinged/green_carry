// src/pages/manager/components/charts/OrderStatsChart.jsx

import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
// import { FiExternalLink } from "react-icons/fi"; // 이전에 icons/fi를 썼다면 유지
import OpenInNewIcon from "@mui/icons-material/OpenInNew"; // 이전에 MUI를 썼다면 유지

const OrderStatsChart = ({ data }) => {
  // apexcharts의 donut 타입을 사용하여 이미지_7.png와 같은 도넛 그래프 구현
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

    colors: ["#2e8147", "#ffb300", "#008080", "#c0e0b0"], // 프로젝트 변수 사용 권장 (Aqua와 Light Green 변수가 없다면 색상 코드를 직접 입력)
    labels: ["배달 경로 1", "배달 경로 2", "배달 경로 3", "배달 경로 4"], // 각 조각의 라벨 (이미지엔 없지만 내부적으론 필요)
    dataLabels: {
      enabled: false, // 차트 조각 위에 데이터를 직접 표시하지 않음 (이미지처럼)
    },
    legend: {
      show: false, // 범례 숨기기 (이미지처럼)
    },
    stroke: {
      show: false, // 조각 사이의 테두리 숨기기 (이미지처럼 매끄럽게)
    },
  };

  //임시 데이터
  const tempSeries = [40, 30, 10, 20];

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
