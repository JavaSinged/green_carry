import { useState } from "react";
import CarbonComparisonChart from "../../../components/layout/chart/ComparisonBarChart";
import MemberCountChart from "../../../components/layout/chart/MemberCountChart";
import TotalSalesChart from "../../../components/layout/chart/TotalSalesChart";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  // 현재 보고 있는 탭 상태 (기본값: 'dashboard')
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className={styles.dashboardContainer}>
      {/* 이미지와 동일한 버튼 그룹 (탭 메뉴) */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "dashboard" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          대시보드
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "inquiry" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("inquiry")}
        >
          회원 문의 내역
        </button>
      </div>

      {/* 탭 내용 분기 처리 */}
      {activeTab === "dashboard" ? (
        /* --- 대시보드 뷰 --- */
        <>
          <div className={styles.fullWidthSection}>
            <TotalSalesChart />
          </div>

          <div className={styles.halfWidthItem}>
            <CarbonComparisonChart />
          </div>

          <div className={styles.halfWidthItem}>
            <MemberCountChart />
          </div>
        </>
      ) : (
        /* --- 회원 문의 내역 뷰 --- */
        <div className={styles.fullWidthSection}>
          <h2 className={styles.inquiryTitle}>회원 문의 내역</h2>
          {/* 여기에 문의 내역 테이블 컴포넌트를 넣으시면 됩니다. */}
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              background: "#fff",
              borderRadius: "16px",
            }}
          >
            <p>등록된 문의 내역이 없습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}
