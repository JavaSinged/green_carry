import { useEffect, useState } from "react";
import styles from "./ManagermenuEdit.module.css";
import { SearchIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ManagermenuEdit = () => {
  // 1. 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenu({ ...menu, [name]: value });
  };
  // 2. 옵션 체크박스 핸들러
  const handleOptionToggle = (optionId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  };

  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const menuId = location.state?.menuId;
  const storeId = location.state?.storeId;

  const [menu, setMenu] = useState({
    menuName: "",
    menuInfo: "",
    menuImage: null,
    menuPrice: "",
    menuCategory: "메인",
  });

  const [allOptions, setAllOptions] = useState([]);

  useEffect(() => {
    // 1. 페이지가 켜지자마자 백엔드에서 전체 옵션/용기 목록을 가져옵니다.
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/options/all`)
      .then((res) => {
        setAllOptions(res.data);
      })
      .catch((err) => console.error("옵션 목록 로드 실패:", err));
  }, []);
  const containerList = allOptions.filter((opt) => opt.optionType === 1); // 용기/사이즈
  const generalList = allOptions.filter((opt) => opt.optionType === 2); // 일반 (치즈 등)
  const ecoList = allOptions.filter((opt) => opt.optionType === 3); // 에코 (다회용기 등)

  // 사용자가 현재 메뉴에 적용하려고 '선택한 옵션 ID들'
  //const [selectedOptionIds, setSelectedOptionIds] = useState([]);

  // 이미지 미리보기용 (선택 사항)
  //const [imagePreview, setImagePreview] = useState("");

  return (
    <div className={styles.menu_edit_container}>
      <div>
        <div className={styles.menu_main_edit}>
          <label>메뉴 이름</label>
          <input
            className={styles.menu_input}
            placeholder="메뉴 이름"
            value={menu.menuName}
            onChange={(e) => setMenu(e.target.value)}
          />
          <label>메뉴 설명</label>
          <input
            className={styles.menu_input}
            placeholder="메뉴 설명"
            value={menu.menuInfo}
            onChange={(e) => setMenu(e.target.value)}
          />
          {/* 검색 결과: containerList에서 필터링 */}
          {searchTerm && (
            <ul className={styles.search_results}>
              {containerList
                .filter((c) => c.optionName.includes(searchTerm))
                .map((c) => (
                  <li key={c.optionNo} onClick={() => addContainer(c)}>
                    {c.optionName} (+{c.optionPrice}원)
                  </li>
                ))}
            </ul>
          )}
          <label>용기 설정</label>
          <div className={styles.search_wrap}>
            <input
              type="search"
              className={styles.search_input}
              placeholder="예) 사각용기(소)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className={styles.search_icon} />
          </div>
        </div>
        <div className={styles.menu_photo_upload}></div>
      </div>
      <div className={styles.sub_edit}>
        <label>추가 옵션</label>
        {/*에코포인트 옵션*/}
        {/*일반 옵션*/}
      </div>
      <div className={styles.btn_wrap}>
        <button>저장</button>
        <button>취소</button>
        <button>삭제</button>
      </div>
    </div>
  );
};

export default ManagermenuEdit;
