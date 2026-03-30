import { Link, Outlet } from 'react-router-dom';
import styles from './Layout.module.css'; // CSS 파일

export default function ManagerLayout() {
  return (
    <div className={styles.container}>
      {/* 👈 왼쪽 고정 사이드바 */}
      <aside className={styles.sidebar}>
        <ul>
          <li>
            <Link to="/mypage/orders">주문내역</Link>
          </li>
          <li>
            <Link to="/mypage/reviews">리뷰관리</Link>
          </li>
          <li>
            <Link to="/mypage/points">에코포인트</Link>
          </li>
          <li>
            <Link to="/mypage/profile">개인정보 수정</Link>
          </li>
        </ul>
      </aside>

      {/* 👉 오른쪽 동적 렌더링 영역 */}
      <main className={styles.content}>
        <Outlet /> {/* 라우터 설정에 따라 이곳의 컴포넌트가 바뀜! */}
      </main>
    </div>
  );
}
