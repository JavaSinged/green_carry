import React, { useEffect, useState } from "react";
import styles from "./AdminStoreManagementDetail.module.css";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const AdminStoreManagementDetail = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { storeId } = useParams();
  const backHost = import.meta.env.VITE_BACKSERVER;
  const [orderList, setOrderList] = useState([{}]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  //페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const filteredList = orderList.filter((item) =>
    item.storeName?.toLowerCase().includes(searchKeyword.toLowerCase()),
  );
  const totalPages = Math.ceil(orderList.length / itemsPerPage);
  const [pageGroup, setPageGroup] = useState(0);
  const pageLimit = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedList = [...filteredList].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // 주문번호 정렬
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // 가격 정렬
    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
  const currentOrders = sortedList.slice(indexOfFirstItem, indexOfLastItem);
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;

  const endPage = Math.min(startPage + pageLimit - 1, totalPages);
  // 페이지 이동 핸들러
  const handlePrevGroup = () => {
    if (pageGroup > 0) {
      setPageGroup(pageGroup - 1);
      setCurrentPage((pageGroup - 1) * pageLimit + 1);
    }
  };
  const handleNextGroup = () => {
    const maxGroup = Math.floor((totalPages - 1) / pageLimit);

    if (pageGroup < maxGroup) {
      setPageGroup(pageGroup + 1);
      setCurrentPage((pageGroup + 1) * pageLimit + 1);
    }
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  ///////////

  const statusMap = {
    0: "결제대기",
    1: "접수대기",
    2: "주문접수",
    3: "조리중",
    4: "배달중",
    5: "배달완료",
    9: "주문취소",
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case "결제대기":
        return { color: "#6b7280", backgroundColor: "#f3f4f6" };

      case "접수대기":
        return { color: "#6366f1", backgroundColor: "#eef2ff" };

      case "주문접수":
        return { color: "#3b82f6", backgroundColor: "#eff6ff" };

      case "조리중":
        return { color: "#06b6d4", backgroundColor: "#ecfeff" };

      case "배달중":
        return { color: "#f59e0b", backgroundColor: "#fff7e8" };

      case "배달완료":
        return { color: "#22c55e", backgroundColor: "#ecfdf3" };
      case "주문취소":
        return { color: "#ef4444", backgroundColor: "#fef2f2" };
      default:
        return {};
    }
  };
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/${storeId}`)
      .then((res) => {
        setOrderList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 3. 필터링 + 정렬이 모두 적용된 데이터 계산
  return (
    <div className={styles.content}>
      <Paper className={styles.card} elevation={0}>
        {/* 🔍 헤더 */}
        <Box className={styles.header}>
          <h2 className={styles.title}>주문 내역</h2>
        </Box>

        {/* 📊 테이블 */}
        <TableContainer>
          <Table>
            <TableHead className={styles.table_head}>
              <TableRow className={styles.headRow}>
                <TableCell>
                  <div
                    className={styles.headerCell}
                    onClick={() => handleSort("orderId")}
                  >
                    주문 번호 <UnfoldMoreIcon className={styles.sort_icon} />
                  </div>
                </TableCell>
                <TableCell>주문자</TableCell>
                <TableCell>상품</TableCell>
                <TableCell>
                  <div
                    className={styles.headerCell}
                    onClick={() => handleSort("totalPrice")}
                  >
                    금액
                    <UnfoldMoreIcon className={styles.sort_icon} />
                  </div>
                </TableCell>
                <TableCell>매장</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentOrders.map((item) => (
                <TableRow key={item.orderId} hover>
                  {/* 주문번호 */}
                  <TableCell className={styles.orderId}>
                    {item.orderId}
                  </TableCell>

                  {/* 주문자 */}
                  <TableCell>
                    <Box className={styles.infoBox}>
                      <Avatar src={item.memberThumb} />
                      <Box>
                        <p className={styles.mainText}>{item.memberId}</p>
                        <span className={styles.subText}>
                          {item.memberEmail}
                        </span>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* 상품 */}
                  <TableCell>
                    <Box className={styles.infoBox}>
                      <img
                        src={
                          `${backHost}${item.menuList?.[0]?.menuImage}` ||
                          "/image/default_menu.png"
                        }
                        className={styles.productImage}
                      />
                      <Box>
                        <p className={styles.mainText}>
                          {item.menuList?.length > 0 && (
                            <>
                              {item.menuList[0].menuName}
                              {item.menuList.length > 1 &&
                                ` 외 ${item.menuList.length - 1}개`}
                            </>
                          )}
                        </p>
                        <span className={styles.subText}>
                          {item.optionString}
                        </span>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* 금액 */}
                  <TableCell>{item.totalPrice?.toLocaleString()}원</TableCell>

                  {/* 매장 */}
                  <TableCell>{item.storeName}</TableCell>

                  {/* 상태 */}
                  <TableCell>
                    <Chip
                      label={statusMap[item.orderStatus] || "알수없음"}
                      size="small"
                      sx={{
                        ...getStatusStyle(statusMap[item.orderStatus]),
                        fontWeight: 700,
                        borderRadius: "999px",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 3. 페이지네이션 영역 */}
        <div className={styles.pagination}>
          <button
            className={styles.page_btn_nav}
            onClick={handlePrevGroup}
            disabled={pageGroup === 0}
          >
            <ChevronLeftIcon fontSize="small" />
            이전
          </button>

          <div className={styles.page_numbers}>
            {Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i,
            ).map((num) => (
              <div
                key={num}
                className={`${styles.page_num} ${
                  currentPage === num ? styles.active : ""
                }`}
                onClick={() => setCurrentPage(num)}
              >
                {String(num).padStart(2, "0")}
              </div>
            ))}
          </div>

          <button
            className={styles.page_btn_nav}
            onClick={handleNextGroup}
            disabled={endPage === totalPages}
          >
            다음
            <ChevronRightIcon fontSize="small" />
          </button>
        </div>
      </Paper>
    </div>
  );
};

export default AdminStoreManagementDetail;
