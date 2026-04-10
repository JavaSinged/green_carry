/* global naver */
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StoreInfoEdit.module.css';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthContext } from '../../../../context/AuthContext';

export default function StoreInfoEdit() {
  const { user } = useContext(AuthContext) || {};
  const storeId = user?.storeId || null;

  const [formData, setFormData] = useState({
    storeName: '',
    storeIntro: '',
    storePhone: '',
    storeAddress: '',
    latitude: null,
    longitude: null,
    businessNumber: '',
    openDate: null,
    storeOriginInfo: '',
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCategory, setActiveCategory] = useState('한식');
  const [hoursType, setHoursType] = useState('same');
  const [is24h, setIs24h] = useState(false);

  const [sameTime, setSameTime] = useState({
    startH: '09',
    startM: '00',
    endH: '22',
    endM: '00',
  });

  const [diffTimes, setDiffTimes] = useState([
    {
      day: 'mon',
      label: '월',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
    {
      day: 'tue',
      label: '화',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
    {
      day: 'wed',
      label: '수',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
    {
      day: 'thu',
      label: '목',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
    {
      day: 'fri',
      label: '금',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
    {
      day: 'sat',
      label: '토',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
    {
      day: 'sun',
      label: '일',
      isOpen: true,
      startH: '09',
      startM: '00',
      endH: '22',
      endM: '00',
    },
  ]);

  const [restDays, setRestDays] = useState([]);

  const categories = [
    { value: '한식', label: '한식' },
    { value: '양식', label: '양식' },
    { value: '중식', label: '중식' },
    { value: '일식', label: '일식' },
    { value: '피자', label: '피자' },
    { value: '치킨', label: '치킨' },
    { value: '샐러드', label: '샐러드' },
    { value: '커피/디저트', label: '커피/디저트' },
  ];

  const restWeekMonthOpts = [
    { value: 'week', label: '매주' },
    { value: 'week2', label: '격주' },
    { value: 'month', label: '매월' },
    { value: 'week3', label: '매월 첫번째' },
    { value: 'week4', label: '매월 두번째' },
    { value: 'week5', label: '매월 세번째' },
    { value: 'week6', label: '매월 네번째' },
  ];

  // 🌟 DB WEEK_OF_MONTH 저장을 위한 매핑 객체
  const weekMonthMapping = {
    week: 0,
    week2: 1,
    month: 2,
    week3: 3,
    week4: 4,
    week5: 5,
    week6: 6,
  };

  // 🌟 DB WEEK_OF_MONTH 역매핑 객체 (불러올 때 사용)
  const reverseWeekMonthMapping = {
    0: 'week',
    1: 'week2',
    2: 'month',
    3: 'week3',
    4: 'week4',
    5: 'week5',
    6: 'week6',
  };
  const restDayOpts = [
    { value: 'mon', label: '월요일' },
    { value: 'tue', label: '화요일' },
    { value: 'wed', label: '수요일' },
    { value: 'thu', label: '목요일' },
    { value: 'fri', label: '금요일' },
    { value: 'sat', label: '토요일' },
    { value: 'sun', label: '일요일' },
  ];

  const openPostcode = useDaumPostcodePopup(
    'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js',
  );

  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '')
        extraAddress +=
          extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    // 🌟 1. input에 들어갈 포맷: (우편번호) 기본주소 + " " (뒤에 상세주소 입력하라고 공백 추가)
    const combinedAddress = `(${data.zonecode}) ${fullAddress} `;

    // 🌟 2. 상세주소가 안 붙은 순수 fullAddress로 위경도 미리 구해놓기
    naver.maps.Service.geocode({ query: fullAddress }, (status, response) => {
      if (
        status === naver.maps.Service.Status.OK &&
        response.v2.addresses.length > 0
      ) {
        const result = response.v2.addresses[0];
        setFormData((prev) => ({
          ...prev,
          storeAddress: combinedAddress,
          latitude: parseFloat(result.y),
          longitude: parseFloat(result.x),
        }));
      } else {
        // 혹시 실패하더라도 주소 텍스트는 들어가야 함
        setFormData((prev) => ({ ...prev, storeAddress: combinedAddress }));
        alert('주소에 해당하는 위치(위/경도)를 찾을 수 없습니다.');
      }
    });
  };

  const handleSearchAddress = () => {
    openPostcode({ onComplete: handleCompletePostcode });
  };

  const renderTimeOptions = (max, step = 1) => {
    const options = [];
    for (let i = 0; i <= max; i += step) {
      const value = i < 10 ? `0${i}` : `${i}`;
      options.push(
        <option key={value} value={value}>
          {value}
        </option>,
      );
    }
    return options;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'storePhone') {
      const nums = value.replace(/\D/g, '');
      if (nums.length <= 3) formattedValue = nums;
      else if (nums.length <= 7)
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
      else
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
    } else if (name === 'businessNumber') {
      const nums = value.replace(/\D/g, '');
      if (nums.length <= 3) formattedValue = nums;
      else if (nums.length <= 5)
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
      else
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5, 10)}`;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    setFormData((prev) => ({
      ...prev,
      openDate: dateString,
    }));
    setShowCalendar(false);
  };

  const handleDiffTimeChange = (index, field, value) => {
    const newDiff = [...diffTimes];
    newDiff[index][field] = value;
    setDiffTimes(newDiff);
  };

  const handleAddRestDay = () => {
    setRestDays([
      ...restDays,
      { id: Date.now(), weekMonth: 'week', day: 'mon' },
    ]);
  };

  const handleRemoveRestDay = (id) => {
    setRestDays(restDays.filter((rd) => rd.id !== id));
  };

  const handleRestDayChange = (id, field, value) => {
    setRestDays(
      restDays.map((rd) => (rd.id === id ? { ...rd, [field]: value } : rd)),
    );
  };

  // --- 🌟 폼 제출 (백엔드 Payload 규격에 맞게 매핑) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.storeName.trim()) return alert('가게명을 입력해주세요.');
    if (!formData.storeIntro.trim()) return alert('가게 소개를 입력해주세요.');
    if (formData.storePhone.length < 12)
      return alert('올바른 가게 번호(13자리)를 입력해주세요.');
    if (!formData.storeAddress.trim())
      return alert('가게 주소를 입력해주세요.');
    // 위경도 값이 없으면 (주소 검색을 제대로 안 했거나 에러가 난 경우) 방어 로직
    if (!formData.latitude || !formData.longitude)
      return alert('주소 검색을 통해 정확한 위치를 설정해주세요.');
    if (formData.businessNumber.length !== 12)
      return alert('사업자 번호(10자리)를 올바르게 입력해주세요.');
    if (!formData.openDate) return alert('개업일자를 선택해주세요.');
    if (!formData.storeOriginInfo.trim())
      return alert('원산지 정보를 입력해주세요.');

    // 1. 전체 주소 조합
    const fullStoreAddress = `(${formData.storeAddrCode}) ${formData.storeAddr} ${formData.storeAddrDetail}`;

    // 2. 영업시간 + 휴무일 통합 리스트 만들기 (operating_hours_tbl 용)
    const operatingHoursList = [];

    // [기본 영업시간 세팅]
    if (hoursType === 'same') {
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      days.forEach((day) => {
        operatingHoursList.push({
          dayOfWeek: day,
          openTime: is24h ? '00:00' : `${sameTime.startH}:${sameTime.startM}`,
          closeTime: is24h ? '23:59' : `${sameTime.endH}:${sameTime.endM}`,
          isDayOff: 'N',
          weekOfMonth: 0, // 매일 영업은 기본 0
        });
      });
    } else {
      diffTimes.forEach((item) => {
        operatingHoursList.push({
          dayOfWeek: item.day,
          openTime: item.isOpen ? `${item.startH}:${item.startM}` : '',
          closeTime: item.isOpen ? `${item.endH}:${item.endM}` : '',
          isDayOff: item.isOpen ? 'N' : 'Y',
          weekOfMonth: 0,
        });
      });
    }

    // [휴무일 세팅] 추가된 정기 휴무일도 객체로 만들어서 넣습니다.
    restDays.forEach((rd) => {
      operatingHoursList.push({
        dayOfWeek: rd.day,
        openTime: '',
        closeTime: '',
        isDayOff: 'Y',
        weekOfMonth: weekMonthMapping[rd.weekMonth], // 0~6 숫자로 변환
      });
    });

    try {
      // 🌟 3. 백엔드 DB 컬럼명에 매칭되는 DTO 키값으로 Payload 재구성
      const payload = {
        // store_tbl 대응
        storeId: storeId,
        storeName: formData.storeName,
        storeAddress: formData.storeAddress, // 우편번호 + 주소 + 상세주소
        storePhone: formData.storePhone,
        storeIntro: formData.storeIntro,
        storeOwner: '', // 받아오는 값이 없으니 빈 문자열 처리
        storeOwnerAddress: formData.storeAddress, // 일단 동일하게 처리
        storeOriginInfo: formData.storeOriginInfo,
        storeOwnerNo: formData.businessNumber,
        storeCategory: activeCategory,
        latitude: formData.latitude,
        longitude: formData.longitude,
        openingDate: formData.openDate, // 이미 YYYY-MM-DD 형태의 문자열임

        // operating_hours_tbl 대응을 위한 리스트
        operatingHours: operatingHoursList,
      };

      const response = await axios.post('/api/store/update', payload);
      if (response.status === 200 || response.data === 'SUCCESS') {
        alert('정보 변경이 완료되었습니다.');
      }
    } catch (error) {
      console.error('저장 실패', error);
      alert('서버 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 🌟 컴포넌트 마운트 시 데이터 불러오기 로직
  useEffect(() => {
    if (!storeId) return;

    const fetchStoreData = async () => {
      try {
        // 백엔드 API 엔드포인트는 실제 환경에 맞게 수정해주세요.
        const response = await axios.get(`/stores/info/${storeId}`);

        if (response.status === 200 && response.data) {
          const data = response.data;

          setFormData((prev) => ({
            ...prev,
            storeName: data.storeName || '',
            storeIntro: data.storeIntro || '',
            storePhone: data.storePhone || '',
            storeAddress: data.storeAddress || '', // 🌟 통문자열 그대로 세팅
            latitude: data.latitude || null, // 🌟 DB에 있는 위도 세팅
            longitude: data.longitude || null, // 🌟 DB에 있는 경도 세팅
            businessNumber: data.storeOwnerNo || '',
            openDate: data.openingDate || null,
            storeOriginInfo: data.storeOriginInfo || '',
          }));

          // 1. 주소 분리 처리 (제출할 때 `(우편번호) 주소 상세주소` 형태로 묶었기 때문)
          let parsedZip = '';
          let parsedAddr = data.storeAddress || '';
          // 띄어쓰기로 결합된 문자열을 주소/상세주소로 완벽히 나누기는 어려우므로
          // 정규식으로 우편번호만 추출하고 나머지를 주소칸에 넣습니다.
          const addrMatch = (data.storeAddress || '').match(
            /^\((.*?)\)\s+(.*)$/,
          );
          if (addrMatch) {
            parsedZip = addrMatch[1];
            parsedAddr = addrMatch[2];
          }

          // 2. 기본 정보 폼 데이터 세팅
          setFormData((prev) => ({
            ...prev,
            storeName: data.storeName || '',
            storeIntro: data.storeIntro || '',
            storePhone: data.storePhone || '',
            storeAddrCode: parsedZip,
            storeAddr: parsedAddr,
            storeAddrDetail: '', // 통문자열의 완벽한 분리가 불가능하다면 비워두거나 직접 수정 유도
            businessNumber: data.storeOwnerNo || '',
            openDate: data.openingDate || null,
            storeOriginInfo: data.storeOriginInfo || '',
          }));

          if (data.storeCategory) setActiveCategory(data.storeCategory);

          // 3. 영업시간 & 휴무일 세팅
          if (data.operatingHours && data.operatingHours.length > 0) {
            const fetchedRestDays = [];
            let fetchedDiffTimes = [...diffTimes]; // 초기값 복사

            let allSame = true; // '매일 같은 시간 영업' 여부 체크용
            let firstOpen = null;
            let firstClose = null;
            let normalDayCount = 0;

            data.operatingHours.forEach((timeInfo) => {
              // 휴무일 데이터 추출 (weekOfMonth가 0보다 큰 경우)
              if (timeInfo.isDayOff === 'Y' && timeInfo.weekOfMonth > 0) {
                fetchedRestDays.push({
                  id: Date.now() + Math.random(), // 임시키 부여
                  weekMonth:
                    reverseWeekMonthMapping[timeInfo.weekOfMonth] || 'week',
                  day: timeInfo.dayOfWeek,
                });
              }
              // 일반 영업일 데이터 추출 (weekOfMonth가 0인 경우)
              else if (timeInfo.weekOfMonth === 0) {
                normalDayCount++;
                const diffIndex = fetchedDiffTimes.findIndex(
                  (d) => d.day === timeInfo.dayOfWeek,
                );

                if (diffIndex !== -1) {
                  const isOpen = timeInfo.isDayOff === 'N';
                  let stH = '09',
                    stM = '00',
                    edH = '22',
                    edM = '00';

                  if (isOpen && timeInfo.openTime && timeInfo.closeTime) {
                    [stH, stM] = timeInfo.openTime.split(':');
                    [edH, edM] = timeInfo.closeTime.split(':');
                  }

                  fetchedDiffTimes[diffIndex] = {
                    ...fetchedDiffTimes[diffIndex],
                    isOpen,
                    startH: stH,
                    startM: stM,
                    endH: edH,
                    endM: edM,
                  };

                  // 매일 동일한 시간인지 검사
                  if (firstOpen === null && isOpen) {
                    firstOpen = timeInfo.openTime;
                    firstClose = timeInfo.closeTime;
                  } else if (isOpen) {
                    if (
                      firstOpen !== timeInfo.openTime ||
                      firstClose !== timeInfo.closeTime
                    ) {
                      allSame = false; // 시간이 하루라도 다름
                    }
                  } else {
                    allSame = false; // 하루라도 쉬는 날이 있음
                  }
                }
              }
            });

            // 상태 업데이트
            setRestDays(fetchedRestDays);

            // 모든 요일이 꽉 차 있고 시간이 동일하면 '매일 같은 시간', 아니면 '요일별 다름'
            if (allSame && normalDayCount === 7) {
              setHoursType('same');
              if (firstOpen === '00:00' && firstClose === '23:59') {
                setIs24h(true);
              } else if (firstOpen && firstClose) {
                const [sH, sM] = firstOpen.split(':');
                const [eH, eM] = firstClose.split(':');
                setSameTime({ startH: sH, startM: sM, endH: eH, endM: eM });
              }
            } else {
              setHoursType('diff');
              setDiffTimes(fetchedDiffTimes);
            }
          }
        }
      } catch (error) {
        console.error('가게 정보를 불러오는 중 오류가 발생했습니다.', error);
      }
    };

    fetchStoreData();
  }, [storeId]); // storeId가 세팅/변경될 때마다 실행

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.infoForm}>
        {/* 가게명 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게명</label>
          <div className={styles.inputWrap}>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className={styles.inputBase}
              maxLength={100}
              placeholder="가게 이름을 입력하세요"
            />
          </div>
        </div>

        {/* 가게 소개 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 소개</label>
          <div className={styles.inputWrap}>
            <textarea
              name="storeIntro"
              value={formData.storeIntro}
              onChange={handleInputChange}
              className={styles.textareaBase}
              placeholder="가게에 대한 소개글을 입력해주세요 (1000자 이내)"
              maxLength={1000}
            />
          </div>
        </div>

        {/* 가게 전화번호 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 전화번호</label>
          <div className={styles.inputWrap}>
            <input
              type="text"
              name="storePhone"
              value={formData.storePhone}
              onChange={handleInputChange}
              className={styles.inputBase}
              placeholder="010-0000-0000"
              maxLength={13}
            />
          </div>
        </div>

        {/* 가게 주소 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 주소</label>
          <div className={styles.inputWrap}>
            <div className={styles.addressTopRow}>
              <input
                type="text"
                name="storeAddress" // 🌟 통합된 name 사용
                value={formData.storeAddress}
                onChange={handleInputChange} // 🌟 사용자가 뒤에 상세주소를 이어서 타이핑할 수 있게 함
                placeholder="(우편번호) 주소를 검색하고 상세주소를 이어서 입력하세요"
                className={styles.inputBase}
              />
              <button
                type="button"
                className={styles.addressSearchBtn}
                onClick={handleSearchAddress}
              >
                주소 찾기
              </button>
            </div>
          </div>
        </div>

        {/* 사업자 번호 */}
        <div className={styles.formRow}>
          <label className={styles.label}>사업자 번호</label>
          <div className={styles.inputWrap}>
            <input
              type="text"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleInputChange}
              placeholder="000-00-00000"
              className={styles.inputBase}
              maxLength={12}
            />
          </div>
        </div>

        {/* 🌟 개업일자 (직접 제어하는 달력 팝업 방식) */}
        <div className={styles.formRow}>
          <label className={styles.label}>개업일자</label>
          <div className={styles.inputWrap}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <input
                type="text"
                name="openDate"
                value={formData.openDate || ''}
                className={styles.inputBase} // 기존 스타일 유지
                placeholder="YYYY-MM-DD"
                readOnly
                onClick={() => setShowCalendar(!showCalendar)}
                style={{ cursor: 'pointer', paddingRight: '35px' }}
              />
              <CalendarMonthIcon
                onClick={() => setShowCalendar(!showCalendar)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  cursor: 'pointer',
                  color: 'var(--color-brand)',
                }}
              />

              {/* 달력 팝업 */}
              {showCalendar && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0', // 오른쪽 정렬을 원하면 right: "0"
                    zIndex: 100,
                    marginTop: '5px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    backgroundColor: '#fff',
                  }}
                >
                  <Calendar
                    onChange={handleDateChange}
                    calendarType="gregory"
                    maxDate={new Date()}
                    value={
                      formData.openDate
                        ? new Date(formData.openDate)
                        : new Date()
                    }
                    formatDay={(locale, date) =>
                      date.toLocaleString('en', { day: 'numeric' })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 카테고리 */}
        <div className={styles.formRow}>
          <label className={styles.label}>카테고리</label>
          <div className={styles.inputWrap}>
            <div className={styles.categoryGroup}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`${styles.categoryBtn} ${
                    activeCategory === cat.value ? styles.categoryBtnActive : ''
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 원산지 정보 */}
        <div className={styles.formRow}>
          <label className={styles.label}>원산지 정보</label>
          <div className={styles.inputWrap}>
            <textarea
              name="storeOriginInfo"
              value={formData.storeOriginInfo}
              onChange={handleInputChange}
              className={styles.textareaBase}
              placeholder="원산지 정보를 입력해주세요 (1000자 이내)"
              maxLength={1000}
            />
          </div>
        </div>

        {/* 이미지 업로드 영역 */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 대표 이미지</label>
          <div className={styles.inputWrap}>
            <div className={styles.imageUploadBox}>
              <input
                type="file"
                id="storeThumb"
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className={styles.uploadContent}>
                <p>가게 대표 이미지</p>
                <p className={styles.uploadHint}>PNG, JPG up to 5MB</p>
                <label htmlFor="storeThumb" className={styles.browseBtn}>
                  Browse Files
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 영업시간 및 휴무일 설정 */}
        <div className={styles.sectionDivider}>영업시간 및 휴무일 설정</div>

        <div className={styles.formRow}>
          <label className={styles.label}>영업시간</label>
          <div className={styles.inputWrap}>
            <div className={styles.hoursToggleGroup}>
              <button
                type="button"
                className={`${styles.hoursToggleBtn} ${
                  hoursType === 'same' ? styles.hoursToggleBtnActive : ''
                }`}
                onClick={() => setHoursType('same')}
              >
                매일 같은 시간에 영업해요{' '}
                {hoursType === 'same' && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </button>
              <button
                type="button"
                className={`${styles.hoursToggleBtn} ${
                  hoursType === 'diff' ? styles.hoursToggleBtnActive : ''
                }`}
                onClick={() => setHoursType('diff')}
              >
                요일별로 다르게 영업해요{' '}
                {hoursType === 'diff' && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </button>
            </div>

            <div className={styles.hoursContentBox}>
              {hoursType === 'same' ? (
                <>
                  <div className={styles.hoursHeaderRow}>
                    <div className={styles.checkboxWrap}>
                      <input
                        type="checkbox"
                        id="is24h"
                        checked={is24h}
                        onChange={(e) => setIs24h(e.target.checked)}
                      />
                      <label htmlFor="is24h">24시간 영업</label>
                    </div>
                  </div>
                  <div className={styles.timeInputRow}>
                    <span className={styles.timeLabel}>시작</span>
                    <select
                      className={styles.timeSelect}
                      value={sameTime.startH}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, startH: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(23)}
                    </select>{' '}
                    시
                    <select
                      className={styles.timeSelect}
                      value={sameTime.startM}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, startM: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(50, 10)}
                    </select>{' '}
                    분
                  </div>
                  <div className={styles.timeInputRow}>
                    <span className={styles.timeLabel}>종료</span>
                    <select
                      className={styles.timeSelect}
                      value={sameTime.endH}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, endH: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(23)}
                    </select>{' '}
                    시
                    <select
                      className={styles.timeSelect}
                      value={sameTime.endM}
                      onChange={(e) =>
                        setSameTime({ ...sameTime, endM: e.target.value })
                      }
                      disabled={is24h}
                    >
                      {renderTimeOptions(50, 10)}
                    </select>{' '}
                    분
                  </div>
                </>
              ) : (
                <div className={styles.diffHoursList}>
                  {diffTimes.map((item, idx) => (
                    <div key={idx} className={styles.dayRow}>
                      <div className={styles.checkboxWrap}>
                        <input
                          type="checkbox"
                          id={`day_${idx}`}
                          checked={item.isOpen}
                          onChange={(e) =>
                            handleDiffTimeChange(
                              idx,
                              'isOpen',
                              e.target.checked,
                            )
                          }
                        />
                        <label htmlFor={`day_${idx}`}>{item.label}요일</label>
                      </div>
                      <div className={styles.dayTimeGroup}>
                        <select
                          className={styles.timeSelect}
                          value={item.startH}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, 'startH', e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(23)}
                        </select>{' '}
                        :
                        <select
                          className={styles.timeSelect}
                          value={item.startM}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, 'startM', e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(50, 10)}
                        </select>
                        <span className={styles.tilde}>~</span>
                        <select
                          className={styles.timeSelect}
                          value={item.endH}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, 'endH', e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(23)}
                        </select>{' '}
                        :
                        <select
                          className={styles.timeSelect}
                          value={item.endM}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, 'endM', e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(50, 10)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 휴무일 설정 */}
        <div className={styles.formRow}>
          <label className={styles.label}>휴무일</label>
          <div className={styles.inputWrap}>
            <div className={styles.restDayBox}>
              {restDays.length === 0 ? (
                <p className={styles.noRestDayMsg}>
                  등록된 정기 휴무일이 없습니다. (연중무휴)
                </p>
              ) : (
                restDays.map((rd) => (
                  <div key={rd.id} className={styles.restDayItem}>
                    <div className={styles.restDaySelects}>
                      <select
                        className={styles.inputBaseSelect}
                        value={rd.weekMonth}
                        onChange={(e) =>
                          handleRestDayChange(
                            rd.id,
                            'weekMonth',
                            e.target.value,
                          )
                        }
                      >
                        {restWeekMonthOpts.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className={styles.inputBaseSelect}
                        value={rd.day}
                        onChange={(e) =>
                          handleRestDayChange(rd.id, 'day', e.target.value)
                        }
                      >
                        {restDayOpts.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRestDay(rd.id)}
                      className={styles.deleteTextBtn}
                    >
                      삭제 🗑️
                    </button>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={handleAddRestDay}
                className={styles.addTextBtn}
              >
                + 정기 휴무일 추가
              </button>
            </div>
          </div>
        </div>

        <div className={styles.submitWrap}>
          <button type="submit" className={styles.submitBtn}>
            정보 변경하기
          </button>
        </div>
      </form>
    </div>
  );
}
