export default function StoreInfoEdit() {
  return (
    <div>
      <div>
        <label htmlFor="storeName">가게 이름</label>
        <input type="text" id="storeName" name="storeName" />
      </div>
      <div>
        <label htmlFor="openingDate">개업 날짜</label>
        <input type="text" id="openingDate" name="openingDate" />
      </div>
      <div>
        <label htmlFor="storePhone">가게 전화번호</label>
        <input type="text" id="storePhone" name="storestorePhonepenDate" />
      </div>
      <div>
        <label htmlFor="storeAddress">가게 주소</label>
        <input type="text" id="storeAddrCode" name="storeAddrCode" readOnly />
        <input type="text" id="storeAddr" name="storeAddr" readOnly />
        <input type="text" id="storeAddrDetail" name="storeAddrDetail" />
        <button>주소 검색</button>
      </div>
      <div>
        <label htmlFor="store">가게 전화번호</label>
        <input type="text" id="storePhone" name="storestorePhonepenDate" />
      </div>
      <div>
        {/* 옵션을 버튼으로 변경 */}
        <label htmlFor="storeCategory">카테고리</label>
        <select id="storeCategory" name="storeCategory">
          <option value="food">한식</option>
          <option value="cafe">양식</option>
          <option value="retail">중식</option>
          <option value="retail">일식</option>
          <option value="retail">피자</option>
          <option value="retail">치킨</option>
          <option value="retail">샐러드</option>
          <option value="retail">커피/디저트</option>
        </select>
      </div>
      <div>
        {/* 이미지만 받을 수 있도록 */}
        <label htmlFor="storThumb">가게 전화번호</label>
        <input type="file" id="storeThumb" name="storeThumb" />
      </div>
      <div>
        <label htmlFor="operating_hours">영업시간</label>
        <button>매일 영업시간이 같아요</button>

        <button>요일별로 영업시간이 달라요</button>
      </div>
    </div>
  );
}
