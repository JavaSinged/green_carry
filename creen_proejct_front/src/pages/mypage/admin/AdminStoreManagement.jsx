import React from 'react';
import styles from './AdminStoreManagement.module.css';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'; // 테이블 헤더 정렬 아이콘용
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function AdminStoreManagement() {
  return (
    <div className={styles.dashboard_container}>
      {/* 1. 헤더 영역 (타이틀 + 검색창) */}
      <div className={styles.header}>
        <h2 className={styles.title}>상점 리스트</h2>
        <div className={styles.search_wrap}>
          <input
            type="search"
            className={styles.search_input}
            placeholder="매장이름 검색"
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
                상점이름 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th>전화번호</th>
              <th>카테고리</th>
              <th>
                당월 매출 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th>
                전월 매출 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
              <th>
                상점 평점 <UnfoldMoreIcon className={styles.sort_icon} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.col_left}>
                <div className={styles.store_info}>
                  <div className={styles.store_text}>
                    <p className={styles.store_name}>[친환경] Product name</p>
                  </div>
                </div>
              </td>
              <td>02-657382229</td>
              <td>
                <span className={styles.badge}>한식</span>
              </td>
              <td>1,394만원</td>
              <td>1,394만원</td>
              <td>
                <div className={styles.rating_wrap}>
                  <div className={styles.stars}>
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                  </div>
                  <span className={styles.rating_score}>5.0</span>
                </div>
              </td>
            </tr>
            {/* 데이터 행 반복 예시 (동일한 구조) */}
            <tr>
              <td className={styles.col_left}>
                <div className={styles.store_info}>
                  <div className={styles.store_text}>
                    <p className={styles.store_name}>Product name</p>
                  </div>
                </div>
              </td>
              <td>02-657382345</td>
              <td>
                <span className={styles.badge}>중식</span>
              </td>
              <td>1,394만원</td>
              <td>1,394만원</td>
              <td>
                <div className={styles.rating_wrap}>
                  <div className={styles.stars}>
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon style={{ color: '#ccc' }} />{' '}
                    {/* 빈 별 처리 예시 */}
                  </div>
                  <span className={styles.rating_score}>4.0</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. 페이지네이션 영역 */}
      <div className={styles.pagination}>
        <button className={styles.page_btn_nav}>
          <ChevronLeftIcon fontSize="small" /> Previous
        </button>
        <div className={styles.page_numbers}>
          <button className={styles.page_num}>01</button>
          <button className={styles.page_num}>02</button>
          <button className={styles.page_num}>03</button>
          <button className={styles.page_num}>04</button>
          <button className={`${styles.page_num} ${styles.active}`}>05</button>
          <span className={styles.page_dots}>...</span>
          <button className={styles.page_num}>40</button>
        </div>
        <button className={styles.page_btn_nav}>
          Next <ChevronRightIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
