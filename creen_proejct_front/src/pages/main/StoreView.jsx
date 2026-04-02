import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./StoreView.module.css";
import SearchIcon from "@mui/icons-material/Search";
import MenuModal from "../../components/layout/MenuModal";
import CartBar from "../../components/layout/ui/CartBar";
import useCartStore from "../../store/useCartStore";

export default function StoreView() {
  const location = useLocation();
  const storeId = location.state?.storeId || 1;
  //store state
  const [storeInfo, setStoreInfo] = useState({
    storeIntro: "",
    storeName: "",
  });
  //menu state
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState(["전체"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const storeName = useCartStore((state) => state.setStoreName);
  const [reusable, setReusable] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // 🚀 서버에서 메뉴 리스트 가져오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/${storeId}/menus`)
      .then((res) => {
        console.log(res.data);
        setMenuList(res.data);

        const uniqueCategories = [
          "전체",
          ...new Set(res.data.map((item) => item.menuCategory)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error("메뉴 로딩 실패:", err));
    //상점 정보 호출
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/${storeId}`)
      .then((res) => {
        console.log(res.data);
        storeName(res.data.storeName);
        setStoreInfo({
          ...storeInfo,
          storeIntro: res.data.storeIntro,
          storeName: res.data.storeName,
        });
        console.log(storeInfo);
      })
      .catch((err) => console.error("가게 로딩 실패:", err));
  }, [storeId]);

  const filteredMenu = menuList.filter((item) => {
    // import { useState } from "react";
    // import { Link } from "react-router-dom";
    // import styles from "./StoreView.module.css";
    // import SearchIcon from "@mui/icons-material/Search";
    // import MenuModal from "../../components/layout/MenuModal";
    // import CartBar from "../../components/layout/ui/CartBar";

    // // ✅ basePrice, description, carbonPer100g 등 상세 정보를 여기서 관리
    // const MENU_DATA = [
    //   {
    //     id: 1,
    //     name: "비건 샐러드",
    //     basePrice: 12400,
    //     category: "메인",
    //     description: "제철 채소와 유기농 드레싱으로 만든 건강한 샐러드",
    //     carbonPer100g: 80,
    //   },
    //   {
    //     id: 2,
    //     name: "두부 스테이크",
    //     basePrice: 15000,
    //     category: "메인",
    //     description: "국산 두부를 직화로 구운 고단백 비건 스테이크",
    //     carbonPer100g: 60,
    //   },
    //   {
    //     id: 3,
    //     name: "감자 튀김",
    //     basePrice: 5000,
    //     category: "사이드",
    //     description: "바삭하게 튀긴 국내산 감자 튀김",
    //     carbonPer100g: 40,
    //   },
    //   {
    //     id: 4,
    //     name: "콜라",
    //     basePrice: 2000,
    //     category: "음료",
    //     description: "시원한 탄산음료",
    //     carbonPer100g: 20,
    //   },
    // ];

    // const CATEGORIES = ["전체", "메인", "사이드", "음료"];

    // export default function StoreView() {
    //   const [isModalOpen, setIsModalOpen] = useState(false);
    //   const [selectedMenu, setSelectedMenu] = useState(null); // ✅ ID 대신 객체 전체 저장
    //   const [selectedCategory, setSelectedCategory] = useState("전체");
    //   const [searchTerm, setSearchTerm] = useState("");
    //   // const { cart, clearCart } = useCartStore((state) => ({
    //   //   cart: state.cart,
    //   //   clearCart: state.clearCart
    //   // }));
    //   const filteredMenu = MENU_DATA.filter((item) => {

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
  const { cart } = useCartStore();
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
                {menu.menuImage && (
                  <img
                    src={menu.menuImage}
                    alt={menu.menuName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
