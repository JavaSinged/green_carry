import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./chart.module.css";
import axios from "axios";

const CarbonComparisonChart = () => {
  const [chartData, setChartData] = useState({
    categories: [],
    currentSeries: [],
    pastSeries: [],
  });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/api/point/stats`)
      .then((res) => {
        const currentCarbon = res.data.currentSeries.map((val) => val / 1000);
        const pastCarbon = res.data.pastSeries.map((val) => val / 1000);
        setChartData({
          categories: res.data.categories,
          currentSeries: currentCarbon,
          pastSeries: pastCarbon,
        });

        console.log("서버 응답 데이터:", res.data);
      });
  }, []);

  const currentTotal =
    chartData.currentSeries?.reduce((acc, cur) => acc + cur, 0) || 0;

  const pastTotal =
    chartData.pastSeries?.reduce((acc, cur) => acc + cur, 0) || 0;

  let growthRate = 0;
  if (pastTotal > 0) {
    growthRate = ((currentTotal - pastTotal) / pastTotal) * 100;
  }

  const series = [
    { name: "2025 ~ 2026", data: chartData.currentSeries },
    { name: "2024 ~ 2025", data: chartData.pastSeries },
  ];

  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    // 전역 변수 컬러에 맞춤: 포인트 오렌지, 브랜드 그린
    colors: ["#2e8147", "#ffb300"],
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: { colors: "#999", fontSize: "12px" },
      },
    },
    yaxis: {
      title: {
        text: "절감량 (Kg)",
        style: { color: "#666", fontWeight: 600 },
      },
      labels: {
        formatter: (val) => val + " Kg",
        style: { colors: "#999" },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => val + " Kg",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      markers: { radius: 12 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  const chartSeries = [
    { name: "2026년", data: [12.5, 15.2, 14.8, 16.0, 13.5, 12.9] },
    { name: "2025년", data: [11.2, 13.8, 12.1, 14.5, 11.9, 11.0] },
  ];

  return (
    <div className={`${styles.container} ${styles.carbonContainer}`}>
      <div className={styles.headerFlex}>
        <div>
          <h3 className={styles.title}>절감된 탄소량 통계</h3>
          <p className={styles.subTitle}>Past 6 months</p>
        </div>
        <div className={styles.valueGroup}>
          <div className={styles.carbonValue}>{currentTotal.toFixed(3)} Kg</div>
          <span
            className={styles.badge}
            style={{ color: growthRate >= 0 ? "#2e8147" : "#e74c3c" }}
          >
            {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}%
          </span>
        </div>
      </div>
      <Chart options={chartOptions} series={series} type="bar" height="100%" />
      {/*<Chart options={chartOptions} series={chartSeries} type="bar" height="100%" />*/}
    </div>
  );
};

export default CarbonComparisonChart;
