import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./StoreView.module.css";
import SearchIcon from "@mui/icons-material/Search";
import MenuModal from "../../components/layout/MenuModal";
import CartBar from "../../components/layout/ui/CartBar";
import useCartStore from "../../store/useCartStore";

export default function StoreView() {
  const backHost = import.meta.env.VITE_BACKSERVER;
  const location = useLocation();
  const storeId = location.state?.storeId || 1;

  // store state
  const [storeInfo, setStoreInfo] = useState({
    storeId: "",
    storeIntro: "",
    storeName: "",
  });

  // menu state
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState(["전체"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const storeName = useCartStore((state) => state.setStoreName);
  const [reusable, setReusable] = useState(false);
  const cartStoreId = useCartStore();

  useEffect(() => {
    window.scrollTo(0, 0);

    // 🚀 서버에서 메뉴 리스트 가져오기
    axios
      .get(`${backHost}/stores/${storeId}/menus`)
      .then((res) => {
        console.log("원본 메뉴 데이터:", res.data);

        // 🌟 [핵심 추가] 판매중(menuStatus === 1)인 메뉴만 필터링해서 남깁니다!
        const activeMenus = res.data.filter((item) => item.menuStatus === 1);

        // 필터링된 메뉴 목록으로 상태 업데이트
        setMenuList(activeMenus);

        // 카테고리도 '판매중인 메뉴'들 안에서만 추출하여 빈 카테고리가 생기지 않도록 함
        const uniqueCategories = [
          "전체",
          ...new Set(activeMenus.map((item) => item.menuCategory)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error("메뉴 로딩 실패:", err));

    // 상점 정보 호출
    axios
      .get(`${backHost}/stores/${storeId}`)
      .then((res) => {
        console.log(res.data);
        storeName(res.data.storeName);
        setStoreInfo({
          ...storeInfo,
          storeIntro: res.data.storeIntro,
          storeName: res.data.storeName,
        });
      })
      .catch((err) => console.error("가게 로딩 실패:", err));
  }, [storeId]);

  // 검색 및 카테고리 필터링 (이미 판매중인 메뉴 안에서 동작함)
  const filteredMenu = menuList.filter((item) => {
    const isCategoryMatch =
      selectedCategory === "전체" || item.menuCategory === selectedCategory;
    const isSearchMatch = item.menuName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  console.log(cartStoreId);

  return (
    <div className={styles.page_container}>
      {/* 상점 정보 영역 */}
      <div className={styles.store_info_section}>
        <div className={styles.store_image_wrap}>
          <div className={styles.image_placeholder}></div>
        </div>
        <div className={styles.store_text_wrap}>
          <h2 className={styles.store_name}>{storeInfo.storeName}</h2>
          <Link
            to="/storeDetail"
            state={{ storeId: storeId }}
            className={styles.store_link}
          >
            가게 정보, 원산지 정보
          </Link>
          <p className={styles.store_desc}>{storeInfo.storeIntro}</p>
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
                className={`${styles.filter_btn} ${selectedCategory === cat ? styles.active : ""}`}
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
                {menu.menuImage ? (
                  <img
                    src={`${backHost}${menu.menuImage}`}
                    alt={menu.menuName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  ></div>
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
                    style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}
                  >
                    {menu.menuInfo}
                  </p>
                )}
              </div>
            </div>
          ))}
          {filteredMenu.length === 0 && (
            <p
              style={{ textAlign: "center", marginTop: "20px", color: "#888" }}
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
