import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./chart.module.css";
import axios from "axios";

const TotalSalesChart = () => {
  const [chartData, setChartData] = useState({
    categories: [],
    currentSeries: [],
    pastSeries: [],
  });

  useEffect(() => {
    // 백엔드에서 데이터 바로 받아오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/api/sales/stats`)
      .then((res) => {
        setChartData(res.data);
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

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    colors: ["#2e8147", "#ffb300"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => (val / 10000).toLocaleString() + "만",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 4,
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock}>
        <h4 className={styles.title}>전 가맹점 매출 통계</h4>
        <div
          className={styles.mainValue}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {currentTotal.toLocaleString()}원
          <span
            className={styles.badge}
            style={{ color: growthRate >= 0 ? "#2e8147" : "#e74c3c" }}
          >
            {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}%
          </span>
        </div>
        <p className={styles.subTitle}>Past 6 months</p>
      </div>

      {chartData.categories?.length > 0 && (
        <Chart options={options} series={series} type="bar" height={300} />
      )}
    </div>
  );
};

export default TotalSalesChart;
