import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import useCartStore from "../../store/useCartStore";

// 이스터에그 컴포넌트
import EcoLightSwitch from "../../components/Easter Egg/EcoLightSwitch";
import EcoRider from "../../components/Easter Egg/EcoRider";
import EcoClean from "../../components/Easter Egg/EcoClean";
import EcoDrone from "../../components/Easter Egg/EcoDrone";
import EcoRecycle from "../../components/Easter Egg/EcoRecycle";
import EcoEarth from "../../components/Easter Egg/EcoEarth";
import EcoFlood from "../../components/Easter Egg/EcoFlood";
import { AuthContext } from "../../context/AuthContext";

const banners = [
  {
    title: "같이 효율적으로 소비하는 플랫폼",
    img: "/image/banner/banner1.png",
  },
  {
    title: "오늘도 그린하게, 지구를 구하는 한 끼",
    img: "/image/banner/banner2.png",
  },
];

const categories = [
  { name: "인기맛집", img: "/image/category/bestFood.png" },
  { name: "한식", img: "/image/category/Kfood.png" },
  { name: "양식", img: "/image/category/wsFood.png" },
  { name: "중식", img: "/image/category/chFood.png" },
  { name: "일식", img: "/image/category/susi.png" },
  { name: "피자", img: "/image/category/pizza.png" },
  { name: "치킨", img: "/image/category/chicken.png" },
  { name: "샐러드", img: "/image/category/salad.png" },
  { name: "커피/디저트", img: "/image/category/dessert.png" },
];

export default function Home() {
  const navigate = useNavigate();
  // 🌟 백엔드 서버 주소 설정
  const backHost = import.meta.env.VITE_BACKSERVER;

  const { user } = useContext(AuthContext);

  console.log("홈에서 확인되는 유저 정보:", user);

  const [isLoading, setLoading] = useState(true); // 로딩 상태 추가
  const { storeId, setStoreId } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState("인기맛집");
  const [searchTerm, setSearchTerm] = useState("");

  const calculateDistance = (storeLat, storeLng) => {
    if (!user?.lat || !user?.lng || !storeLat || !storeLng)
      return "위치 정보 없음";

    // 하버사인 공식으로 직접 계산 (네이버 Projection은 지도 로드 후에만 동작)
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((storeLat - user.lat) * Math.PI) / 180;
    const dLng = ((storeLng - user.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((user.lat * Math.PI) / 180) *
        Math.cos((storeLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1
      ? `${Math.round(distance * 1000)}m` // 1km 미만은 m 단위로
      : `${distance.toFixed(1)}km`;
  };

  // 1. 서버에서 받아온 원본 리스트를 저장할 State
  const [storeList, setStoreList] = useState([]);

  // 🚀 서버 데이터 로드
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backHost}/stores`)
      .then((res) => {
        console.log("서버 데이터 확인:", res.data);
        // 서버에서 넘어온 배열 데이터를 상태에 저장
        setStoreList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로딩 에러:", err);
        setLoading(false);
      });
  }, [backHost]);

  // 🔍 검색 및 카테고리 필터링
  const filteredStores = storeList.filter((store) => {
    const isCategoryMatch =
      selectedCategory === "인기맛집" ||
      store.storeCategory === selectedCategory;

    const isSearchMatch = store.storeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return isCategoryMatch && isSearchMatch;
  });

  // ⭐ 별점 렌더링 함수
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <StarIcon key={i} sx={{ color: "#ffb300", fontSize: "1.2rem" }} />,
        );
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(
          <StarHalfIcon
            key={i}
            sx={{ color: "#ffb300", fontSize: "1.2rem" }}
          />,
        );
      } else {
        stars.push(
          <StarOutlineIcon
            key={i}
            sx={{ color: "#ccc", fontSize: "1.2rem" }}
          />,
        );
      }
    }
    return stars;
  };

  return (
    <div className={styles.page_container}>
      {/* 이스터에그 컴포넌트 */}
      <EcoLightSwitch />
      <EcoClean />
      <EcoRider />
      <EcoDrone />
      <EcoRecycle />
      <EcoEarth />
      <EcoFlood />

      {/* 1. 배너 영역 */}
      <div className={styles.banner_wrap}>
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 10000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination, Navigation]}
          className={styles.mySwiper}
        >
          {banners.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div
                className={styles.banner_slide}
                style={{ backgroundImage: `url(${item.img})` }}
              >
                <div className={styles.banner_text_box}>
                  <h3 className={styles.banner_title}>{item.title}</h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.content_wrap}>
        {/* 2. 카테고리 바 */}
        <div className={styles.category_wrap}>
          {categories.map((item) => (
            <div
              key={item.name}
              className={`${styles.category_item} ${
                selectedCategory === item.name ? styles.active : ""
              }`}
              onClick={() => setSelectedCategory(item.name)}
            >
              <div className={styles.category_img_circle}>
                <img
                  src={item.img}
                  alt={item.name}
                  className={styles.category_icon}
                />
              </div>
              <p>{item.name}</p>
            </div>
          ))}
        </div>

        {/* 3. 검색창 */}
        <div className={styles.search_container}>
          <div className={styles.search_wrap}>
            <input
              type="search"
              placeholder="매장 이름을 입력하세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className={styles.search_icon} />
          </div>
        </div>

        {/* 4. 카드 목록 */}
        <div className={styles.card_wrap}>
          {isLoading ? (
            // 로딩 중 스켈레톤 UI
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`${styles.card_item} ${styles.skeleton_card}`}
              >
                <div
                  className={`${styles.image_wrap} ${styles.skeleton_img}`}
                ></div>
                <div className={styles.card_info}>
                  <div className={styles.skeleton_title}></div>
                  <div className={styles.skeleton_tags}></div>
                  <div className={styles.skeleton_rating}></div>
                </div>
              </div>
            ))
          ) : filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div
                key={store.storeId}
                className={styles.card_item}
                onClick={() => {
                  setStoreId(store.storeId);
                  navigate("/storeView", {
                    state: { storeId: store.storeId },
                  });
                }}
              >
                <div className={styles.image_wrap}>
                  <img
                    src={
                      store.storeThumb
                        ? `${backHost}/${store.storeThumb}`
                        : "/image/default_store.png"
                    }
                    alt={store.storeName}
                    style={{ objectFit: "cover" }}
                  />
                  {/* 서버 데이터에 거리가 없다면 임시값이나 위치 계산값 사용 */}

                  <div className={styles.card_badge}>
                    {calculateDistance(store.LATITUDE, store.LONGITUDE)}
                  </div>
                </div>
                <div className={styles.card_info}>
                  <h3 className={styles.store_name}>{store.storeName}</h3>
                  <div className={styles.store_tags}>
                    <span>{store.storeCategory}</span>
                    <span>30분</span>
                  </div>
                  <div className={styles.store_rating_wrap}>
                    <div className={styles.stars_box}>
                      {renderStars(store.storeRating)}
                    </div>
                    <span className={styles.rating_number}>
                      {store.storeRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty_msg_box}>
              <p className={styles.empty_msg}>
                해당 카테고리에 등록된 매장이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
