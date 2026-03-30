import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import SearchIcon from '@mui/icons-material/Search';

const banners = [
  {
    title: '같이 효율적으로 소비하는 플랫폼',
    img: '/image/banner/banner1.png',
  },
  {
    title: '오늘도 그린하게, 지구를 구하는 한 끼',
    img: '/image/banner/banner2.png',
  },
];

const categories = [
  { name: '인기맛집', img: '/image/category/bestFood.png' },
  { name: '한식', img: '/image/category/Kfood.png' },
  { name: '양식', img: '/image/category/wsFood.png' },
  { name: '중식', img: '/image/category/chFood.png' },
  { name: '일식', img: '/image/category/susi.png' },
  { name: '피자', img: '/image/category/pizza.png' },
  { name: '치킨', img: '/image/category/chicken.png' },
  { name: '샐러드', img: '/image/category/salad.png' },
  { name: '커피/디저트', img: '/image/category/dessert.png' },
];

export default function Home() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('인기맛집');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 서버에서 받아온 원본 리스트를 저장할 State
  const [storeList, setStoreList] = useState([]);

  // 2. 서버 데이터를 가져오는 useEffect
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores`)
      .then((res) => {
        console.log('서버 데이터 확인:', res.data);
        // 서버에서 넘어온 배열 데이터를 상태에 저장
        setStoreList(res.data);
      })
      .catch((err) => {
        console.error('데이터 로딩 에러:', err);
      });
  }, []);

  // 3. 필터링 로직 (storeList가 변경될 때마다 자동 계산)
  // 서버 데이터 필드명에 맞춰 수정 (storeName, storeCategory 등)
  const filteredStores = storeList.filter((store) => {
    const isCategoryMatch =
      selectedCategory === '인기맛집' ||
      store.storeCategory === selectedCategory;

    const isSearchMatch = store.storeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return isCategoryMatch && isSearchMatch;
  });

  return (
    <div className={styles.page_container}>
      {/* 1. 배너 (기존 유지) */}
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
                selectedCategory === item.name ? styles.active : ''
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

        {/* 4. 카드 목록 (서버에서 받아온 실제 필드값 바인딩) */}
        <div className={styles.card_wrap}>
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div
                key={store.storeId} // storeId 사용
                className={styles.card_item}
                // 클릭 시 해당 상점 ID를 가지고 이동하거나 상세 페이지 로직 처리
                onClick={() =>
                  navigate('/storeView', { state: { storeId: store.storeId } })
                }
              >
                <div className={styles.image_wrap}>
                  {/* storeThumb가 null일 경우 기본 이미지 처리 */}
                  <img
                    src={store.storeThumb || '/image/default_store.png'}
                    alt={store.storeName}
                  />
                  {/* 서버 데이터에 거리가 없다면 임시값이나 위치 계산값 사용 */}
                  <div className={styles.card_badge}>약 100m</div>
                </div>
                <div className={styles.card_info}>
                  <h3 className={styles.store_name}>{store.storeName}</h3>
                  <div className={styles.store_tags}>
                    <span>{store.storeCategory}</span>
                    <span>30분</span>
                  </div>
                  <div className={styles.store_rating}>
                    {/* 별점 숫자만큼 아이콘이나 점수 표시 */}
                    <span>😊 {store.storeRating * 20}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty_msg_box}>
              <p className={styles.empty_msg}>
                아직 등록된 매장이 없거나 검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
