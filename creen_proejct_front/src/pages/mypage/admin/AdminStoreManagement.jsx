import React, { useEffect, useState } from "react";
import styles from "./AdminStoreManagement.module.css";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminStoreManagement() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const backHost = import.meta.env.VITE_BACKSERVER;
  // 1. 정렬 상태 관리 (key: 기준컬럼, direction: 'asc' 또는 'desc')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [orderType, setOrderType] = useState(0);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores`)
      .then((res) => {
        // 매출 데이터가 없으므로 정렬 테스트를 위해 가짜 데이터(sales)를 주입해봅니다.
        console.log(res.data);

        const now = new Date();

        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

        const dataWithSales = res.data.map((item) => {
          const salesList = item.SaleMonth || [];

          const currentData = salesList.find(
            (sale) => sale.saleMonth === currentMonth,
          );
          const prevData = salesList.find(
            (sale) => sale.saleMonth === prevMonth,
          );

          return {
            ...item,
            currentSales: currentData?.totalSales || 0,
            prevSales: prevData?.totalSales || 0,
          };
        });

        setStores(dataWithSales);

        setStores(dataWithSales);
      })
      .catch((err) => console.log(err));
  }, []);
  // 2. 정렬 실행 함수
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 3. 필터링 + 정렬이 모두 적용된 데이터 계산
  const getSortedStores = () => {
    // 먼저 검색어로 필터링
    let items = stores.filter((store) =>
      store.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 그 다음 정렬 적용
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  };

  const sortedStores = getSortedStores();

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i)
        stars.push(<StarIcon key={i} style={{ color: "#ffb300" }} />);
      else if (rating >= i - 0.5)
        stars.push(<StarHalfIcon key={i} style={{ color: "#ffb300" }} />);
      else stars.push(<StarOutlineIcon key={i} style={{ color: "#ccc" }} />);
    }
    return stars;
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.header}>
        <h2 className={styles.title}>상점 리스트</h2>
        <div className={styles.search_wrap}>
          <input
            type="search"
            className={styles.search_input}
            placeholder="매장이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className={styles.search_icon} />
        </div>
      </div>

      <div className={styles.table_wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {/* 클릭 시 각 컬럼 키값을 넘겨줌 */}
              <th
                className={styles.col_left}
                onClick={() => handleSort("storeName")}
              >
                상점이름 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th>전화번호</th>
              <th>카테고리</th>
              <th onClick={() => handleSort("currentSales")}>
                당월 매출 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th onClick={() => handleSort("prevSales")}>
                총 매출 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th onClick={() => handleSort("storeRating")}>
                상점 평점 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStores.map((store) => (
              <tr
                key={store.storeId}
                className={styles.table_row}
                onClick={() => {
                  navigate(`detail/${store.storeId}`);
                }}
              >
                <td className={styles.col_left}>
                  <div className={styles.store_info}>
                    <div className={styles.store_image_placeholder}>
                      <img
                        src={
                          store.storeThumb
                            ? `${backHost}/${store.storeThumb}`
                            : "/image/default_store.png"
                        }
                      />
                    </div>
                    <div className={styles.store_text}>
                      <p className={styles.store_name}>{store.storeName}</p>
                      <span className={styles.store_sub}>
                        {store.storeAddress}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{store.storePhone}</td>
                <td>
                  <span className={styles.badge}>{store.storeCategory}</span>
                </td>
                {/* 당월 */}
                <td>{store.currentSales?.toLocaleString()}원</td>
                {/* 전월 */}
                <td>
                  {store.totalSale ? store.totalSale?.toLocaleString() : 0}원
                </td>
                <td>
                  <div className={styles.rating_wrap}>
                    <div className={styles.stars}>
                      {renderStars(store.storeRating)}
                    </div>
                    <span className={styles.rating_score}>
                      {store.storeRating?.toFixed(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <button className={styles.page_btn_nav}>
          <ChevronLeftIcon fontSize="small" /> 이전
        </button>
        <div className={styles.page_numbers}>
          <button className={`${styles.page_num} ${styles.active}`}>01</button>
        </div>
        <button className={styles.page_btn_nav}>
          다음 <ChevronRightIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
