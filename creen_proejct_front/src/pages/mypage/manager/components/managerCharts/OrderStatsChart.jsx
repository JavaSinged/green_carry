import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

const OrderStatsChart = ({ data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <div className={styles.noData}>당월 주문 데이터가 존재하지 않습니다.</div>
    );
  }

  const series = data.map((item) => item.percent); // 배달수단 비중
  const labels = data.map((item) => item.label); // 배달수단 카테고리
  const chartColors = data.map((item) => {
    if (item.deliveryType === 1) return "var(--color-point)";
    if (item.deliveryType === 2) return "var(--color-brand)";
    return "var(--color-info)";
  });
  const totalAmount = data.reduce((sum, item) => sum + item.seriesAmount, 0); // 총매출

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
              formatter: () => {
                if (totalAmount !== undefined && totalAmount !== null) {
                  return totalAmount.toLocaleString() + "원";
                }
                return "0원";
              },
            },
          },
        },
      },
    },

    colors: chartColors,
    labels: labels,
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

  return (
    <div className={styles.chartContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>주문 통계</span>
        <button
          className={styles.viewMoreBtn}
          onClick={() => {
            navigate("/mypage/manager/orders");
          }}
        >
          View more
          <OpenInNewIcon style={{ fontSize: "1rem", marginLeft: "4px" }} />
        </button>
      </div>

      <div className={styles.mainValue}>
        {totalAmount !== undefined && totalAmount !== null
          ? totalAmount.toLocaleString()
          : 0}
        원
      </div>

      {/* 차트 타입을 donut으로 명시하고 height를 적절히 조절 */}
      <Chart options={options} series={series} type="donut" height={350} />
    </div>
  );
};

export default OrderStatsChart;
