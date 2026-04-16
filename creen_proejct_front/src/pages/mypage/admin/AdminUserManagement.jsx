import { useEffect, useState, useMemo } from "react";
import styles from "./AdminStoreManagement.module.css";
import axios from "axios";

// MUI Icons 임포트
import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Pagination from "../../../components/commons/Pagination";

export default function AdminUserManagement() {
  const [memberList, setMemberList] = useState([]);
  const backHost = import.meta.env.VITE_BACKSERVER;

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 📌 검색어 및 정렬 상태 추가
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

  // 📌 검색어 입력 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 무조건 1페이지로 리셋
  };

  // 📌 정렬 클릭 핸들러
  const handleSort = (key) => {
    let direction = "asc";
    // 같은 컬럼을 다시 클릭하면 정렬 방향 반전
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 📌 데이터 가공 파이프라인 (필터링 -> 정렬)
  // useMemo를 사용하여 검색어, 정렬기준, 원본데이터가 바뀔 때만 재계산하여 성능 최적화
  const processedMembers = useMemo(() => {
    // 1. 검색 (회원 아이디 기준)
    let filtered = memberList;
    if (searchTerm) {
      filtered = filtered.filter((member) =>
        member.memberId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 2. 정렬
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

  // 📌 가공된 데이터(processedMembers)를 기준으로 페이지네이션 계산
  const totalPages = Math.ceil(processedMembers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = processedMembers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // 페이지 이동 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.dashboard_container}>
      {/* 1. 헤더 영역 */}
      <div className={styles.header}>
        <h2 className={styles.title}>회원 테이블</h2>
        <div className={styles.search_wrap}>
          {/* 📌 onChange 이벤트 및 value 연결 */}
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

      {/* 2. 테이블 영역 */}
      <div className={styles.table_wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.col_left}>
                {/* 📌 onClick 이벤트 연결 및 cursor 속성 추가 */}
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
              <th className={styles.col_left}>
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
              <th className={styles.col_left}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
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
                  {/* 프로필 섹션 */}
                  <td className={styles.col_left}>
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

                  {/* 회원 분류 */}
                  <td className={styles.col_left}>
                    <span className={styles.store_name}>
                      {member.memberGrade === 1
                        ? "일반 회원"
                        : member.memberGrade === 2
                          ? "사업자 회원"
                          : "관리자"}
                    </span>
                  </td>

                  {/* 상태 뱃지 */}
                  <td className={styles.col_center}>
                    <span
                      className={styles.badge}
                      style={{
                        backgroundColor:
                          member.memberStatus === 1 ? "#E8F5E9" : "#FFEBEE",
                        color:
                          member.memberStatus === 1 ? "#2E7D32" : "#D32F2F",
                        padding: "4px 12px",
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

      {/* 3. 페이지네이션 영역 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
