import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export default function UserLayout() {
  return (
    <div className={styles.container}>
      {/* 👈 왼쪽 고정 사이드바 */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>마이페이지</h2>
        <ul>
          <li>
            <NavLink
              to="/mypage/user"
              end
              className={({ isActive }) => (isActive ? styles.activeMenu : '')}
            >
              에코포인트
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/reviews"
              className={({ isActive }) => (isActive ? styles.activeMenu : '')}
            >
              리뷰관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/orders"
              className={({ isActive }) => (isActive ? styles.activeMenu : '')}
            >
              주문내역
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/user/userInfoEdit"
              className={({ isActive }) => (isActive ? styles.activeMenu : '')}
            >
              개인정보 수정
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/user/userInfo"
              className={({ isActive }) => (isActive ? styles.activeMenu : '')}
            >
              고객센터
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* 👉 오른쪽 동적 렌더링 영역 */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
