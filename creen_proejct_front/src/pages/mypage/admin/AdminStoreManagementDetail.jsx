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
  Modal, // ✨ 모달 추가
  CircularProgress, // ✨ 로딩 스피너 추가
  IconButton, // ✨ 닫기 버튼용
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // ✨ 닫기 아이콘 추가
import axios from "axios";
import { useParams } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const AdminStoreManagementDetail = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { storeId } = useParams();
  const backHost = import.meta.env.VITE_BACKSERVER;
  const [orderList, setOrderList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ✨ 모달 관련 State 추가
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailMenus, setDetailMenus] = useState([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  //페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const filteredList = orderList.filter((item) =>
    item.storeName?.toLowerCase().includes(searchKeyword.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const [pageGroup, setPageGroup] = useState(0);
  const pageLimit = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const sortedList = [...filteredList].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const currentOrders = sortedList.slice(indexOfFirstItem, indexOfLastItem);
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

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
      .get(`${backHost}/admin/${storeId}`)
      .then((res) => {
        setOrderList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [storeId]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✨ 행 클릭 시 상세 메뉴를 불러오는 함수
  const handleRowClick = async (order) => {
    setSelectedOrder(order);
    setOpenDetailModal(true);
    setIsLoadingDetail(true);

    try {
      // 🚀 백엔드에 새로 만들 '상세메뉴만 가져오는 API' 호출
      const res = await axios.get(
        `${backHost}/admin/order-detail/${order.orderId}`,
      );
      setDetailMenus(res.data);
    } catch (err) {
      console.error("상세 메뉴를 불러오는데 실패했습니다.", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setOpenDetailModal(false);
    setSelectedOrder(null);
    setDetailMenus([]);
  };

  // 모달 스타일 설정
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    maxHeight: "80vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    outline: "none",
  };

  return (
    <div className={styles.content}>
      <Paper className={styles.card} elevation={0}>
        <Box className={styles.header}>
          <h2 className={styles.title}>주문 내역</h2>
        </Box>

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
                    금액 <UnfoldMoreIcon className={styles.sort_icon} />
                  </div>
                </TableCell>
                <TableCell>매장</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentOrders.map((item) => (
                <TableRow
                  key={item.orderId}
                  hover
                  // ✨ 행 클릭 이벤트 추가 (마우스 커서 변경)
                  onClick={() => handleRowClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell className={styles.orderId}>
                    {item.orderId}
                  </TableCell>

                  <TableCell>
                    <Box className={styles.infoBox}>
                      <Avatar src={item.memberThumb} />
                      <Box>
                        <p className={styles.mainText}>
                          {item.memberId || item.memberEmail}
                        </p>
                        <span className={styles.subText}>
                          {item.memberEmail}
                        </span>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* ✨ 원래 백엔드 데이터 포맷(요약본)에 맞게 수정됨 */}
                  <TableCell>
                    <Box className={styles.infoBox}>
                      <img
                        src={
                          `${item.menuList?.[0]?.menuImage}` ||
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
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>{item.totalPrice?.toLocaleString()}원</TableCell>

                  <TableCell>{item.storeName}</TableCell>

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

        <div className={styles.pagination}>
          <button
            className={styles.page_btn_nav}
            onClick={handlePrevGroup}
            disabled={pageGroup === 0}
          >
            <ChevronLeftIcon fontSize="small" /> 이전
          </button>

          <div className={styles.page_numbers}>
            {Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i,
            ).map((num) => (
              <div
                key={num}
                className={`${styles.page_num} ${currentPage === num ? styles.active : ""}`}
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
            다음 <ChevronRightIcon fontSize="small" />
          </button>
        </div>
      </Paper>

      {/* ✨ 상세 주문 모달 UI 추가 */}
      <Modal open={openDetailModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {/* 헤더 부분 */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              주문 상세내역 (No.{selectedOrder?.orderId})
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* 로딩 중일 때 스피너 표시 */}
          {isLoadingDetail ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {/* 가져온 상세 메뉴 리스트 출력 */}
              {detailMenus.map((menu, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={menu.menuImage || "/image/default_menu.png"}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                  <Box flex={1}>
                    <Typography fontWeight="bold">{menu.menuName}</Typography>
                    {menu.options && (
                      <Typography variant="body2" color="text.secondary">
                        {menu.options}
                      </Typography>
                    )}
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2">{menu.quantity}개</Typography>
                    <Typography fontWeight="bold">
                      {(menu.price * menu.quantity).toLocaleString()}원
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* 총 결제 금액 */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  총 결제 금액
                </Typography>
                <Typography
                  variant="h6"
                  color="var(--color-brand)"
                  fontWeight="bold"
                >
                  {selectedOrder?.totalPrice?.toLocaleString()}원
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AdminStoreManagementDetail;
