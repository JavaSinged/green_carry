import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; // 🌟 useParams로 주소창 ID 감지
import axios from "axios";
import styles from "./StoreView.module.css";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import MenuModal from "../../components/layout/MenuModal";
import CartBar from "../../components/layout/ui/CartBar";
import useCartStore from "../../store/useCartStore";
import { AuthContext } from "../../context/AuthContext";
import Swal from "sweetalert2";
export default function StoreView() {
  const { id } = useParams(); // 🌟 URL 파라미터 (/storeView/3) 에서 '3'을 직접 추출
  const navigate = useNavigate();
  const backHost = import.meta.env.VITE_BACKSERVER;

  // 🌟 주소창의 ID를 숫자로 변환 (이게 이 페이지의 절대적인 기준점입니다)
  const storeId = id ? Number(id) : null;

  const [reviewCount, setReviewCount] = useState(0);

  // 1. 가게 정보 상태
  const [storeInfo, setStoreInfo] = useState({
    storeId: "",
    storeIntro: "",
    storeName: "",
    storeThumb: "",
    storeRating: 0,
  });

  // 2. 메뉴 정보 상태
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState(["전체"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const { isLogin } = useContext(AuthContext);
  const setGlobalStoreName = useCartStore((state) => state.setStoreName);

  useEffect(() => {
    // 🌟 URL에 ID가 없으면 홈으로 보냅니다 (잘못된 접근 방지)
    if (!id) {
      navigate("/");
      return;
    }

    window.scrollTo(0, 0);

    // 🚀 [메뉴 로드]
    axios
      .get(`${backHost}/stores/${storeId}/menus`)
      .then((res) => {
        const activeMenus = res.data.filter((item) => item.menuStatus === 1);
        setMenuList(activeMenus);
        const uniqueCategories = [
          "전체",
          ...new Set(activeMenus.map((item) => item.menuCategory)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error("메뉴 로딩 실패:", err));

    // 🚀 [상점 정보 로드]
    axios
      .get(`${backHost}/stores/${storeId}`)
      .then((res) => {
        if (res.data.storeName) setGlobalStoreName(res.data.storeName);
        setStoreInfo({
          storeId: res.data.storeId,
          storeIntro: res.data.storeIntro,
          storeName: res.data.storeName,
          storeThumb: res.data.storeThumb,
          storeRating: res.data.storeRating || 0,
        });
      })
      .catch((err) => console.error("가게 로딩 실패:", err));

    // 🚀 [리뷰 개수 로드]
    axios
      .get(`${backHost}/stores/reviews/${storeId}`)
      .then((res) => {
        setReviewCount(res.data.length);
      })
      .catch((err) => console.error("리뷰 로딩 실패:", err));
  }, [storeId, backHost, setGlobalStoreName, navigate, id]);

  const filteredMenu = menuList.filter((item) => {
    const isCategoryMatch =
      selectedCategory === "전체" || item.menuCategory === selectedCategory;
    const isSearchMatch = item.menuName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  const handleMenuClick = (menu) => {
    if (isLogin) {
      setSelectedMenu(menu);
      setIsModalOpen(true);
    } else {
      Swal.fire({
        title: "로그인 후 이용 가능합니다",
        icon: "warning",
      });
      navigate("/login");
      return;
    }
  };
  return (
    <div className={styles.page_container}>
      {/* 상단: 상점 대표 정보 영역 */}
      <div className={styles.store_info_section}>
        <div className={styles.store_image_wrap}>
          {storeInfo.storeThumb ? (
            <img
              src={storeInfo.storeThumb}
              alt={storeInfo.storeName}
              className={styles.store_main_img}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className={styles.image_placeholder}>
              <span style={{ color: "#999" }}>사진 준비 중 🥘</span>
            </div>
          )}
        </div>

        <div className={styles.store_text_wrap}>
          <div className={styles.title_row}>
            <h2 className={styles.store_name}>
              {storeInfo.storeName || "로딩 중..."}
            </h2>

            <div className={styles.store_rating_box}>
              <StarIcon className={styles.star_icon} />
              <span className={styles.rating_num}>
                {(storeInfo.storeRating || 0).toFixed(1)}
              </span>

              <span className={styles.review_count_text}>
                ({reviewCount.toLocaleString()})
              </span>

              {/* 🌟 리뷰 보기 Link 수정: state 대신 storeId 직접 전달 권장 */}
              <Link
                to={`/storeReviews/${storeId}`}
                className={styles.review_count_link}
              >
                리뷰 보기 {">"}
              </Link>
            </div>
          </div>

          <Link
            to={`/storeDetail/${storeId}`}
            state={{ storeId: storeId }}
            className={styles.store_link}
          >
            가게 정보, 원산지 정보 {">"}
          </Link>
          <p className={styles.store_desc}>{storeInfo.storeIntro}</p>
        </div>
      </div>

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
                className={`${styles.filter_btn} ${
                  selectedCategory === cat ? styles.active : ""
                }`}
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
                    src={menu.menuImage}
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
                  <div className={styles.no_image_box}></div>
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
            <div className={styles.empty_menu}>
              현재 주문 가능한 메뉴가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 🌟 [핵심] 모달에 현재 매장 ID를 전달할 때 URL에서 가져온 storeId를 직접 사용 */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuData={selectedMenu}
        currentStoreId={Number(storeId)}
        currentStoreName={storeInfo.storeName}
      />
      <CartBar />
    </div>
  );
}
