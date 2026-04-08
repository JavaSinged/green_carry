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
  Checkbox,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import axios from "axios";
import { useParams } from "react-router-dom";

const AdminStoreManagementDetail = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { storeId } = useParams();
  const backHost = import.meta.env.VITE_BACKSERVER;
  // ✅ state 제대로 선언
  const [orderList, setOrderList] = useState([{}]);

  // ✅ 검색 필터
  const filteredList = orderList.filter((item) =>
    item.storeName?.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  // ✅ 상태 스타일
  const getStatusStyle = (status) => {
    if (status === "배송완료") {
      return { color: "#22c55e", backgroundColor: "#ecfdf3" };
    }
    if (status === "배송중") {
      return { color: "#f59e0b", backgroundColor: "#fff7e8" };
    }
    if (status === "조리중") {
      return { color: "#06b6d4", backgroundColor: "#ecfeff" };
    }
    return {};
  };
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/${storeId}`)
      .then((res) => {
        console.log(res.data);
        setOrderList(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className={styles.content}>
      <Paper className={styles.card} elevation={0}>
        {/* 🔍 헤더 */}
        <Box className={styles.header}>
          <h2 className={styles.title}>주문 내역</h2>

          <TextField
            placeholder="매장 명 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="small"
            className={styles.searchField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 📊 테이블 */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className={styles.headRow}>
                <TableCell />
                <TableCell>주문 번호</TableCell>
                <TableCell>주문자</TableCell>
                <TableCell>상품</TableCell>
                <TableCell>금액</TableCell>
                <TableCell>매장</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredList.map((item) => (
                <TableRow key={item.orderId} hover>
                  <TableCell>
                    <Checkbox />
                  </TableCell>

                  {/* 주문번호 */}
                  <TableCell>{item.orderId}</TableCell>

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
                          {item.menuList?.[0]?.menuName} 외{" "}
                          {item.menuList.length - 1}
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
                      label={item.orderStatus}
                      size="small"
                      sx={{
                        ...getStatusStyle(item.orderStatus),
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

        {/* 📄 페이지네이션 */}
        <Box className={styles.paginationWrap}>
          <Button startIcon={<KeyboardArrowLeftIcon />}>Previous</Button>

          <Box className={styles.pageList}>
            <button>1</button>
            <button>2</button>
            <button className={styles.active}>3</button>
            <button>4</button>
          </Box>

          <Button endIcon={<KeyboardArrowRightIcon />}>Next</Button>
        </Box>
      </Paper>
    </div>
  );
};

export default AdminStoreManagementDetail;
