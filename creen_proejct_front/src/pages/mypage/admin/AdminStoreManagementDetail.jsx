import React, { useState } from "react";
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
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const AdminStoreManagementDetail = () => {
  const [searchKeyword, setSearchKeyword] = useState("");

  const orderList = [
    {
      orderNo: "03-495837521",
      userName: "Steve Owens",
      userEmail: "steve@gmail.com",
      productName: "Product name",
      productOption: "Purple",
      amount: 90.0,
      storeName: "가 업체",
      status: "배송완료",
      profileImage: "https://i.pravatar.cc/40?img=1",
      productImage: "https://picsum.photos/50/50?random=1",
    },
    {
      orderNo: "03-495837522",
      userName: "Moser Killin",
      userEmail: "mokill@gmail.com",
      productName: "Product name",
      productOption: "Red",
      amount: 80.2,
      storeName: "나 업체",
      status: "배송중",
      profileImage: "https://i.pravatar.cc/40?img=2",
      productImage: "https://picsum.photos/50/50?random=2",
    },
    {
      orderNo: "03-495837523",
      userName: "Harry Jenskin",
      userEmail: "jenskinhry@gmail.com",
      productName: "Product name",
      productOption: "Green",
      amount: 170.0,
      storeName: "다 업체",
      status: "조리중",
      profileImage: "https://i.pravatar.cc/40?img=3",
      productImage: "https://picsum.photos/50/50?random=3",
    },
    {
      orderNo: "03-495837524",
      userName: "Emily Forge",
      userEmail: "emforge@yahoo.com",
      productName: "Product name",
      productOption: "Yellow",
      amount: 140.9,
      storeName: "가 업체",
      status: "배송중",
      profileImage: "https://i.pravatar.cc/40?img=4",
      productImage: "https://picsum.photos/50/50?random=4",
    },
    {
      orderNo: "03-495837525",
      userName: "Bailey Garcia",
      userEmail: "baigar@office.com",
      productName: "Product name",
      productOption: "Purple",
      amount: 120.0,
      storeName: "가 업체",
      status: "배송중",
      profileImage: "https://i.pravatar.cc/40?img=5",
      productImage: "https://picsum.photos/50/50?random=5",
    },
    {
      orderNo: "03-495837526",
      userName: "Mason Kendall",
      userEmail: "kendallm@yahoo.com",
      productName: "Product name",
      productOption: "Orange",
      amount: 110.6,
      storeName: "나 업체",
      status: "배송완료",
      profileImage: "https://i.pravatar.cc/40?img=6",
      productImage: "https://picsum.photos/50/50?random=6",
    },
    {
      orderNo: "03-495837527",
      userName: "Gillian Rue",
      userEmail: "ggrules@office.com",
      productName: "Product name",
      productOption: "Red",
      amount: 80.0,
      storeName: "라 업체",
      status: "배송완료",
      profileImage: "https://i.pravatar.cc/40?img=7",
      productImage: "https://picsum.photos/50/50?random=7",
    },
  ];

  const filteredList = orderList.filter((item) =>
    item.storeName.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const getStatusStyle = (status) => {
    if (status === "배송완료") {
      return {
        color: "#22c55e",
        backgroundColor: "#ecfdf3",
      };
    }
    if (status === "배송중") {
      return {
        color: "#f59e0b",
        backgroundColor: "#fff7e8",
      };
    }
    if (status === "조리중") {
      return {
        color: "#06b6d4",
        backgroundColor: "#ecfeff",
      };
    }
    return {};
  };

  return (
    <div className={styles.content}>
      <Paper className={styles.card} elevation={0}>
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
                  <SearchIcon sx={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className={styles.headRow}>
                <TableCell className={styles.checkboxCell}></TableCell>

                <TableCell className={styles.headCell}>
                  <Box className={styles.thInner}>
                    주문 번호
                    <UnfoldMoreIcon sx={{ fontSize: 16 }} />
                  </Box>
                </TableCell>

                <TableCell className={styles.headCell}>
                  <Box className={styles.thInner}>
                    주문자
                    <UnfoldMoreIcon sx={{ fontSize: 16 }} />
                  </Box>
                </TableCell>

                <TableCell className={styles.headCell}>상품 명</TableCell>
                <TableCell className={styles.headCell}>주문 금액</TableCell>
                <TableCell className={styles.headCell}>매장 명</TableCell>
                <TableCell className={styles.headCell}>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredList.map((item) => (
                <TableRow key={item.orderNo} hover className={styles.bodyRow}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>

                  <TableCell className={styles.bodyCell}>
                    {item.orderNo}
                  </TableCell>

                  <TableCell className={styles.bodyCell}>
                    <Box className={styles.infoBox}>
                      <Avatar
                        src={item.profileImage}
                        alt={item.userName}
                        sx={{ width: 38, height: 38 }}
                      />
                      <Box>
                        <p className={styles.mainText}>{item.userName}</p>
                        <span className={styles.subText}>{item.userEmail}</span>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell className={styles.bodyCell}>
                    <Box className={styles.infoBox}>
                      <Box
                        component="img"
                        src={item.productImage}
                        alt={item.productName}
                        className={styles.productImage}
                      />
                      <Box>
                        <p className={styles.mainText}>{item.productName}</p>
                        <span className={styles.subText}>
                          {item.productOption}
                        </span>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell className={styles.bodyCell}>
                    ${item.amount.toFixed(2)}
                  </TableCell>

                  <TableCell className={styles.bodyCell}>
                    {item.storeName}
                  </TableCell>

                  <TableCell className={styles.bodyCell}>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        ...getStatusStyle(item.status),
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

        <Box className={styles.paginationWrap}>
          <Button
            variant="outlined"
            className={styles.pageMoveBtn}
            startIcon={<KeyboardArrowLeftIcon />}
          >
            Previous
          </Button>

          <Box className={styles.pageList}>
            <button className={styles.pageBtn}>01</button>
            <button className={styles.pageBtn}>02</button>
            <button className={styles.pageBtn}>03</button>
            <button className={styles.pageBtn}>04</button>
            <button className={`${styles.pageBtn} ${styles.active}`}>05</button>
            <button className={styles.pageBtn}>...</button>
            <button className={styles.pageBtn}>40</button>
          </Box>

          <Button
            variant="outlined"
            className={styles.pageMoveBtn}
            endIcon={<KeyboardArrowRightIcon />}
          >
            Next
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default AdminStoreManagementDetail;
