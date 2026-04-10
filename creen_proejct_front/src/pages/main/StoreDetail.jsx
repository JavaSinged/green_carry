import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './StoreDetail.module.css';

export default function StoreDetail() {
  const location = useLocation();
  const storeId = location.state?.storeId || 1;

  const [storeInfo, setStoreInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapElement = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 요일 영어 -> 한글 매핑
  const dayMap = {
    mon: '월요일',
    tue: '화요일',
    wed: '수요일',
    thu: '목요일',
    fri: '금요일',
    sat: '토요일',
    sun: '일요일',
  };

  // 주차 숫자 -> 한글 매핑
  const weekMap = {
    0: '매주',
    1: '매월 첫번째',
    2: '매월 두번째',
    3: '매월 세번째',
    4: '매월 네번째',
  };

  const dayOrder = {
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
    sun: 7,
  };

  const [operatingHours, setOperatingHours] = useState([]);

  useEffect(() => {
    if (!storeId) return;

    // 1. 매장 상세 정보 가져오기 (이름, 주소 등)
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/${storeId}`)
      .then((res) => {
        console.log('매장 상세 정보:', res.data);
        setStoreInfo(res.data); // 여기에 매장 객체 저장
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('상점 정보 로딩 실패:', err);
        setIsLoading(false);
      });

    // 2. 운영시간/휴무일 리스트 가져오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/${storeId}/hours`)
      .then((res) => {
        console.log('운영시간 리스트:', res.data);

        // 🌟 받아온 배열을 요일 순서대로 정렬
        const sortedHours = [...res.data].sort((a, b) => {
          // 만약 weekOfMonth가 0인 기본 영업시간을 우선하고 싶다면 이 로직을 활용하세요
          if (a.weekOfMonth !== b.weekOfMonth) {
            return a.weekOfMonth - b.weekOfMonth;
          }
          // 요일 순서대로 정렬
          return (
            dayOrder[a.dayOfWeek.toLowerCase()] -
            dayOrder[b.dayOfWeek.toLowerCase()]
          );
        });

        setOperatingHours(sortedHours);
      })
      .catch((err) => {
        console.error('운영시간 로딩 실패:', err);
      });
  }, [storeId]);

  useEffect(() => {
    const checkNaver = setInterval(() => {
      if (window.naver && window.naver.maps && mapElement.current) {
        setMapLoaded(true);
        clearInterval(checkNaver);
      }
    }, 100);
    return () => clearInterval(checkNaver);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapElement.current || !storeInfo) return;
    const { naver } = window;

    const lat = storeInfo.LATITUDE || 37.497952;
    const lng = storeInfo.LONGITUDE || 127.027619;

    const location = new naver.maps.LatLng(lat, lng);

    try {
      const map = new naver.maps.Map(mapElement.current, {
        center: location,
        zoom: 17,
        zoomControl: true,
        minZoom: 10,
      });
      new naver.maps.Marker({
        position: location,
        map,
        icon: {
          content: `<div style="
            background:#1a1a2e;
            color:#fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            width:40px; height:40px;
            display:flex; align-items:center; justify-content:center;
            font-size:18px; box-shadow:0 2px 8px rgba(0,0,0,0.3);
          "><span style="transform:rotate(45deg)">🍽️</span></div>`,
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40),
        },
      });
    } catch (e) {
      console.error('지도 생성 중 에러:', e);
    }
  }, [mapLoaded, storeInfo]);

  if (isLoading)
    return (
      <div className={styles.container}>상점 정보를 불러오는 중입니다...</div>
    );
  if (!storeInfo)
    return (
      <div className={styles.container}>상점 정보를 찾을 수 없습니다.</div>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>매장정보</h2>

      {/* 지도 */}
      <div className={styles.mapWrapper}>
        {!mapLoaded && (
          <div className={styles.mapLoading}>지도를 불러오는 중입니다...</div>
        )}
        <div ref={mapElement} className={styles.map} />
      </div>

      {/* 매장 기본 정보 */}
      <section className={styles.section}>
        <h3 className={styles.storeName}>{storeInfo.storeName}</h3>
        <table className={styles.infoTable}>
          <tbody>
            <tr>
              <th>상호명</th>
              <td>{storeInfo.storeName}</td>
            </tr>
            <tr>
              <th>주소</th>
              <td>{storeInfo.storeAddress}</td>
            </tr>
            <tr>
              <th>운영시간</th>
              <td>
                {operatingHours
                  .filter((h) => h.isDayOff === 'N')
                  .map((h) => (
                    <div key={h.dayOfWeek}>
                      {/* 요일을 한글로 변환하여 표시 */}
                      {dayMap[h.dayOfWeek?.toLowerCase()] || h.dayOfWeek} :{' '}
                      {h.openTime} ~ {h.closeTime}
                    </div>
                  ))}
              </td>
            </tr>
            <tr>
              <th>휴무일</th>
              <td>
                {(() => {
                  const dayOffList = operatingHours.filter(
                    (h) => h.isDayOff === 'Y',
                  );

                  if (dayOffList.length > 0) {
                    return dayOffList
                      .map((h) => {
                        const weekPrefix = weekMap[h.weekOfMonth] || '';
                        const dayText =
                          dayMap[h.dayOfWeek?.toLowerCase()] || h.dayOfWeek;
                        return `${weekPrefix} ${dayText}`;
                      })
                      .join(', ');
                  }

                  // 운영 데이터가 7개 미만이면 정보 부족으로 판단
                  if (operatingHours.length < 7 && operatingHours.length > 0) {
                    return '직접 문의';
                  }

                  return '연중무휴';
                })()}
              </td>
            </tr>
            <tr>
              <th>전화번호</th>
              <td>{storeInfo.storePhone}</td>
            </tr>
            {/* 운영시간과 휴무일은 VO에 없으므로 일단 제외하거나 추후 추가 필요 */}
          </tbody>
        </table>
      </section>

      {/* 매장 소개 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>매장 소개</h3>
        <p className={styles.description}>{storeInfo.storeIntro}</p>
      </section>

      {/* 사업자 정보 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>사업자 정보</h3>
        <table className={styles.infoTable}>
          <tbody>
            <tr>
              <th>대표자명</th>
              <td>{storeInfo.storeOwner}</td>
            </tr>
            <tr>
              <th>상호명</th>
              <td>{storeInfo.storeName}</td>
            </tr>
            <tr>
              <th>사업자 주소</th>
              <td>{storeInfo.storeOwnerAddress}</td>
            </tr>
            <tr>
              <th>사업자등록번호</th>
              <td>{storeInfo.storeOwnerNo}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 원산지 표기 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>원산지 표기</h3>
        <p className={styles.description}>{storeInfo.storeOriginInfo}</p>
      </section>
    </div>
  );
}
