import React, { useState } from "react";
import axios from "axios";
import styles from "./StoreInfoEdit.module.css";
import { useDaumPostcodePopup } from "react-daum-postcode";

export default function StoreInfoEdit({ storeId = 1 }) {
  // 1. 기본 폼 데이터 상태
  const [formData, setFormData] = useState({
    storeName: "",
    storeIntro: "",
    storePhone: "",
    storeAddrCode: "", // 우편번호
    storeAddr: "", // 기본주소
    storeAddrDetail: "",
    businessNumber: "",
    storeOriginInfo: "",
  });

  const [activeCategory, setActiveCategory] = useState("한식");
  const [hoursType, setHoursType] = useState("same");
  const [is24h, setIs24h] = useState(false);

  // 2. 영업시간 상태
  const [sameTime, setSameTime] = useState({
    startH: "09",
    startM: "00",
    endH: "22",
    endM: "00",
  });

  const [diffTimes, setDiffTimes] = useState([
    {
      day: "mon",
      label: "월",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "tue",
      label: "화",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "wed",
      label: "수",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "thu",
      label: "목",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "fri",
      label: "금",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "sat",
      label: "토",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
    {
      day: "sun",
      label: "일",
      isOpen: true,
      startH: "09",
      startM: "00",
      endH: "22",
      endM: "00",
    },
  ]);

  // 3. 동적 휴무일 배열 상태
  const [restDays, setRestDays] = useState([]);

  // --- 옵션 데이터 ---
  const categories = [
    { value: "한식", label: "한식" },
    { value: "양식", label: "양식" },
    { value: "중식", label: "중식" },
    { value: "일식", label: "일식" },
    { value: "피자", label: "피자" },
    { value: "치킨", label: "치킨" },
    { value: "샐러드", label: "샐러드" },
    { value: "커피/디저트", label: "커피/디저트" },
  ];

  const restWeekMonthOpts = [
    { value: "week", label: "매주" },
    { value: "week2", label: "격주" },
    { value: "month", label: "매월" },
    { value: "week3", label: "매월 첫번째" },
    { value: "week4", label: "매월 두번째" },
    { value: "week5", label: "매월 세번째" },
    { value: "week6", label: "매월 네번째" },
  ];

  const restDayOpts = [
    { value: "mon", label: "월요일" },
    { value: "tue", label: "화요일" },
    { value: "wed", label: "수요일" },
    { value: "thu", label: "목요일" },
    { value: "fri", label: "금요일" },
    { value: "sat", label: "토요일" },
    { value: "sun", label: "일요일" },
  ];

  // 🌟 다음 우편번호 API 핸들러 수정 완료
  const openPostcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  );

  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    // 수정: setNewAddress 대신 setFormData 사용, 필드명을 state와 일치시킴
    setFormData((prev) => ({
      ...prev,
      storeAddrCode: data.zonecode,
      storeAddr: fullAddress,
    }));
  };

  const handleSearchAddress = () => {
    openPostcode({ onComplete: handleCompletePostcode });
  };

  // 시간 select 헬퍼
  const renderTimeOptions = (max, step = 1) => {
    const options = [];
    for (let i = 0; i <= max; i += step) {
      const value = i < 10 ? `0${i}` : `${i}`;
      options.push(
        <option key={value} value={value}>
          {value}
        </option>
      );
    }
    return options;
  };

  // --- 텍스트 입력 핸들러 ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "storePhone") {
      const nums = value.replace(/\D/g, "");
      if (nums.length <= 3) formattedValue = nums;
      else if (nums.length <= 7)
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
      else
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(
          7,
          11
        )}`;
    } else if (name === "businessNumber") {
      const nums = value.replace(/\D/g, "");
      if (nums.length <= 3) formattedValue = nums;
      else if (nums.length <= 5)
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
      else
        formattedValue = `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(
          5,
          10
        )}`;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // --- 휴무일 및 영업시간 핸들러 ---
  const handleDiffTimeChange = (index, field, value) => {
    const newDiff = [...diffTimes];
    newDiff[index][field] = value;
    setDiffTimes(newDiff);
  };

  const handleAddRestDay = () => {
    setRestDays([
      ...restDays,
      { id: Date.now(), weekMonth: "week", day: "mon" },
    ]);
  };

  const handleRemoveRestDay = (id) => {
    setRestDays(restDays.filter((rd) => rd.id !== id));
  };

  const handleRestDayChange = (id, field, value) => {
    setRestDays(
      restDays.map((rd) => (rd.id === id ? { ...rd, [field]: value } : rd))
    );
  };

  // --- 폼 제출 ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.storeName.trim()) return alert("가게명을 입력해주세요.");
    if (!formData.storeIntro.trim()) return alert("가게 소개를 입력해주세요.");
    if (formData.storePhone.length < 12)
      return alert("올바른 가게 번호(13자리)를 입력해주세요.");
    if (!formData.storeAddrDetail.trim())
      return alert("상세 주소를 입력해주세요.");
    if (formData.businessNumber.length !== 12)
      return alert("사업자 번호(10자리)를 올바르게 입력해주세요.");
    if (!formData.storeOriginInfo.trim())
      return alert("원산지 정보를 입력해주세요.");

    const payload = {
      storeId,
      ...formData,
      storeCategory: activeCategory,
      hoursInfo: {
        hoursType,
        is24h,
        sameTime: hoursType === "same" ? sameTime : null,
        diffTimes: hoursType === "diff" ? diffTimes : null,
        restDays,
      },
    };

    try {
      const response = await axios.post("/api/store/update", payload);
      if (response.status === 200 || response.data === "SUCCESS") {
        alert("정보 변경이 완료되었습니다.");
      }
    } catch (error) {
      console.error("저장 실패", error);
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

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

        {/* 가게 주소 (🌟 value 바인딩 수정됨) */}
        <div className={styles.formRow}>
          <label className={styles.label}>가게 주소</label>
          <div className={styles.inputWrap}>
            <div className={styles.addressTopRow}>
              <input
                type="text"
                readOnly
                placeholder="우편번호"
                className={styles.inputBase}
                value={formData.storeAddrCode} // 🌟 추가됨
              />
              <button
                type="button"
                className={styles.addressSearchBtn}
                onClick={handleSearchAddress}
              >
                주소 찾기
              </button>
            </div>
            <input
              type="text"
              readOnly
              placeholder="주소"
              className={styles.inputBase}
              style={{ marginBottom: "8px" }}
              value={formData.storeAddr} // 🌟 추가됨
            />
            <input
              type="text"
              name="storeAddrDetail"
              value={formData.storeAddrDetail}
              onChange={handleInputChange}
              placeholder="상세주소를 입력하세요"
              className={styles.inputBase}
              maxLength={40}
            />
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
                    activeCategory === cat.value ? styles.categoryBtnActive : ""
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
                style={{ display: "none" }}
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
                  hoursType === "same" ? styles.hoursToggleBtnActive : ""
                }`}
                onClick={() => setHoursType("same")}
              >
                매일 같은 시간에 영업해요{" "}
                {hoursType === "same" && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </button>
              <button
                type="button"
                className={`${styles.hoursToggleBtn} ${
                  hoursType === "diff" ? styles.hoursToggleBtnActive : ""
                }`}
                onClick={() => setHoursType("diff")}
              >
                요일별로 다르게 영업해요{" "}
                {hoursType === "diff" && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </button>
            </div>

            <div className={styles.hoursContentBox}>
              {hoursType === "same" ? (
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
                    </select>{" "}
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
                    </select>{" "}
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
                    </select>{" "}
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
                    </select>{" "}
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
                              "isOpen",
                              e.target.checked
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
                            handleDiffTimeChange(idx, "startH", e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(23)}
                        </select>{" "}
                        :
                        <select
                          className={styles.timeSelect}
                          value={item.startM}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, "startM", e.target.value)
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
                            handleDiffTimeChange(idx, "endH", e.target.value)
                          }
                          disabled={!item.isOpen}
                        >
                          {renderTimeOptions(23)}
                        </select>{" "}
                        :
                        <select
                          className={styles.timeSelect}
                          value={item.endM}
                          onChange={(e) =>
                            handleDiffTimeChange(idx, "endM", e.target.value)
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
                            "weekMonth",
                            e.target.value
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
                          handleRestDayChange(rd.id, "day", e.target.value)
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
