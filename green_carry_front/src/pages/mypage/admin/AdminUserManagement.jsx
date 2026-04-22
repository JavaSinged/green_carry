import { useEffect, useState, useMemo } from "react";
import styles from "./AdminStoreManagement.module.css";
import axios from "axios";

import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Pagination from "../../../components/commons/Pagination";

export default function AdminUserManagement() {
  const [memberList, setMemberList] = useState([]);
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/member`)
      .then((res) => {
        setMemberList(res.data);
      })
      .catch((err) => {
        console.error("데이터 로딩 실패:", err);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const processedMembers = useMemo(() => {
    let filtered = memberList;
    if (searchTerm) {
      filtered = filtered.filter((member) =>
        member.memberId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [memberList, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedMembers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = processedMembers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.header}>
        <h2 className={styles.title}>회원 테이블</h2>
        <div className={styles.search_wrap}>
          <input
            type="search"
            placeholder="회원 아이디 검색"
            className={styles.search_input}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SearchIcon className={styles.search_icon} />
        </div>
      </div>

      <div className={styles.table_wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.col_left} ${styles.col_name}`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("memberName")}
                >
                  <PersonOutlineIcon fontSize="small" /> 이름{" "}
                  <UnfoldMoreIcon className={styles.sort_icon} />
                </div>
              </th>
              <th className={`${styles.col_left} ${styles.col_grade}`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("memberGrade")}
                >
                  <BusinessCenterIcon fontSize="small" /> 회원 분류{" "}
                  <UnfoldMoreIcon className={styles.sort_icon} />
                </div>
              </th>
              <th className={`${styles.col_center} ${styles.col_status}`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("memberStatus")}
                >
                  <AccessTimeIcon fontSize="small" /> 회원 상태{" "}
                  <UnfoldMoreIcon className={styles.sort_icon} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.length > 0 ? (
              currentMembers.map((member, index) => (
                <tr key={index} className={styles.table_row}>
                  <td className={`${styles.col_left} ${styles.col_name}`}>
                    <div className={styles.store_info}>
                      <div className={styles.store_image_placeholder}>
                        <img
                          src={
                            member.memberThumb
                              ? `${member.memberThumb}`
                              : "/image/default-user.png"
                          }
                          alt="profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className={styles.store_text}>
                        <span className={styles.store_name}>
                          {member.memberName}
                        </span>
                        <span className={styles.store_sub}>
                          {member.memberId}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className={`${styles.col_left} ${styles.col_grade}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BusinessCenterIcon fontSize="small" style={{ visibility: "hidden" }} />
                      <span className={styles.store_name}>
                        {member.memberGrade === 1
                          ? "일반 회원"
                          : member.memberGrade === 2
                            ? "사업자 회원"
                            : "관리자"}
                      </span>
                      <UnfoldMoreIcon className={styles.sort_icon} style={{ visibility: "hidden" }} />
                    </div>
                  </td>

                  <td className={`${styles.col_center} ${styles.col_status}`}>
                    <span
                      className={styles.badge}
                      style={{
                        backgroundColor:
                          member.memberStatus === 1 ? "#E8F5E9" : "#FFEBEE",
                        color:
                          member.memberStatus === 1 ? "#2E7D32" : "#D32F2F",
                      }}
                    >
                      {member.memberStatus === 1 ? "정상" : "탈퇴"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    padding: "40px",
                    color: "#999",
                    textAlign: "center",
                  }}
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}