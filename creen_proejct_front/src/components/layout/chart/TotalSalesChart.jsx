import React from "react";
import Chart from "react-apexcharts";
import styles from "./chart.module.css";

const TotalSalesChart = () => {
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
    colors: ["#2e8147", "#ffb300"], // 2026(브랜드 그린), 2025(포인트 오렌지)
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => val.toLocaleString() + "만",
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

  const series = [
    { name: "2026년", data: [72, 55, 62, 45, 68, 65] },
    { name: "2025년", data: [38, 30, 28, 78, 20, 38] },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock}>
        <h4 className={styles.title}>전 가맹점 매출 통계</h4>
        <div
          className={styles.mainValue}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          102,000,200원
          <span className={styles.badge}>↑ 00%</span>
        </div>
        <p className={styles.subTitle}>Past 6 months</p>
      </div>

      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};

export default TotalSalesChart;
