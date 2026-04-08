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

  // 1. 가게 정보 상태 (썸네일 포함)
  const [storeInfo, setStoreInfo] = useState({
    storeId: "",
    storeIntro: "",
    storeName: "",
    storeThumb: "",
  });

  // 2. 메뉴 정보 상태
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState(["전체"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");

  const setGlobalStoreName = useCartStore((state) => state.setStoreName);
  const cartStoreId = useCartStore();

  useEffect(() => {
    window.scrollTo(0, 0);

    // 🚀 [메뉴 로드] 판매중(menuStatus === 1)인 메뉴만 필터링
    axios
      .get(`${backHost}/stores/${storeId}/menus`)
      .then((res) => {
        const activeMenus = res.data.filter((item) => item.menuStatus === 1);
        setMenuList(activeMenus);

        // 카테고리도 판매중인 메뉴 목록에서만 추출
        const uniqueCategories = [
          "전체",
          ...new Set(activeMenus.map((item) => item.menuCategory)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error("메뉴 로딩 실패:", err));

    // 🚀 [상점 정보 로드] 썸네일 경로 포함
    axios
      .get(`${backHost}/stores/${storeId}`)
      .then((res) => {
        console.log("🔥 서버에서 받은 상점 정보:", res.data);

        // 전역 스토어 이름 설정 (장바구니용)
        if (res.data.storeName) setGlobalStoreName(res.data.storeName);

        setStoreInfo({
          storeId: res.data.storeId,
          storeIntro: res.data.storeIntro,
          storeName: res.data.storeName,
          storeThumb: res.data.storeThumb, // 예: "uploads/store/main.jpg"
        });
      })
      .catch((err) => console.error("가게 로딩 실패:", err));
  }, [storeId, backHost, setGlobalStoreName]);

  // 검색 및 카테고리 필터링 로직
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

  return (
    <div className={styles.page_container}>
      {/* 상단: 상점 대표 정보 영역 */}
      <div className={styles.store_info_section}>
        <div className={styles.store_image_wrap}>
          {storeInfo.storeThumb ? (
            <img
              /* 🌟 주소 결합 시 중간에 / 가 중복되거나 빠지지 않도록 처리 */
              src={`${backHost}/${storeInfo.storeThumb}`}
              alt={storeInfo.storeName}
              className={styles.store_main_img}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                // 외부 사이트 접속 오류 방지를 위해 로컬 기본 이미지나 스타일 처리
                console.log("썸네일 이미지 로드 실패");
                e.target.style.display = "none";
              }}
            />
          ) : (
            /* 썸네일 데이터가 없을 때 보여줄 기본 박스 */
            <div className={styles.image_placeholder}>
              <span style={{ color: "#999" }}>사진 준비 중 🥘</span>
            </div>
          )}
        </div>

        <div className={styles.store_text_wrap}>
          <h2 className={styles.store_name}>
            {storeInfo.storeName || "로딩 중..."}
          </h2>
          <Link
            to="/storeDetail"
            state={{ storeId: storeId }}
            className={styles.store_link}
          >
            가게 정보, 원산지 정보 {">"}
          </Link>
          <p className={styles.store_desc}>{storeInfo.storeIntro}</p>
        </div>
      </div>

      {/* 하단: 메뉴 리스트 영역 */}
      <div className={styles.menu_section}>
        <div className={styles.menu_controls}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              placeholder="메뉴 이름 검색"
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
                      objectFit: "cover",
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
                      backgroundColor: "#f5f5f5",
                    }}
                  ></div>
                )}
              </div>
              <div className={styles.menu_info}>
                <span className={styles.menu_title}>{menu.menuName}</span>
                <p className={styles.menu_price}>
                  {menu.menuPrice?.toLocaleString()}원
                </p>
                {menu.menuInfo && (
                  <p className={styles.menu_desc}>{menu.menuInfo}</p>
                )}
              </div>
            </div>
          ))}

          {filteredMenu.length === 0 && (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                padding: "50px 0",
                color: "#888",
              }}
            >
              현재 주문 가능한 메뉴가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 모달 및 장바구니 바 */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuData={selectedMenu}
      />
      <CartBar />
    </div>
  );
}
