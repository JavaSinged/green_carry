import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './StoreView.module.css';
import SearchIcon from '@mui/icons-material/Search';
import MenuModal from '../../components/layout/MenuModal';
import CartBar from '../../components/layout/ui/CartBar';

export default function StoreView() {
  const location = useLocation();
  const storeId = location.state?.storeId || 1;

  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState(['전체']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 🚀 서버에서 메뉴 리스트 가져오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/${storeId}/menus`)
      .then((res) => {
        setMenuList(res.data);
        const uniqueCategories = [
          '전체',
          ...new Set(res.data.map((item) => item.menuCategory)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error('메뉴 로딩 실패:', err));
  }, [storeId]);

  const filteredMenu = menuList.filter((item) => {
    const isCategoryMatch =
      selectedCategory === '전체' || item.menuCategory === selectedCategory;
    const isSearchMatch = item.menuName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.page_container}>
      {/* 상점 정보 영역 */}
      <div className={styles.store_info_section}>
        <div className={styles.store_image_wrap}>
          <div className={styles.image_placeholder}></div>
        </div>
        <div className={styles.store_text_wrap}>
          <h2 className={styles.store_name}>지웅이네 김치찜</h2>
          <Link to="/storeDetail" className={styles.store_link}>
            가게 정보, 원산지 정보
          </Link>
          <p className={styles.store_desc}>
            정성을 다해 끓인 김치찜 전문점입니다.
          </p>
        </div>
      </div>

      {/* 메뉴 리스트 영역 */}
      <div className={styles.menu_section}>
        <div className={styles.menu_controls}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              placeholder="메뉴 이름"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className={styles.search_icon} />
          </div>

          <div className={styles.filter_wrap}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filter_btn} ${selectedCategory === cat ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.menu_grid}>
          {filteredMenu.map((menu) => (
            <div
              key={menu.menuId}
              className={styles.menu_card}
              onClick={() => handleMenuClick(menu)}
            >
              <div className={styles.menu_image}>
                {menu.menuImage && (
                  <img
                    src={menu.menuImage}
                    alt={menu.menuName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>
              <div className={styles.menu_info}>
                <span className={styles.menu_title}>{menu.menuName}</span>
                <p className={styles.menu_price}>
                  {menu.menuPrice.toLocaleString()}원
                </p>
                {menu.menuInfo && (
                  <p
                    className={styles.menu_desc}
                    style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}
                  >
                    {menu.menuInfo}
                  </p>
                )}
              </div>
            </div>
          ))}
          {filteredMenu.length === 0 && (
            <p
              style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}
            >
              해당 메뉴가 없습니다.
            </p>
          )}
        </div>
      </div>

      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuData={selectedMenu}
      />
      <CartBar />
    </div>
  );
}
