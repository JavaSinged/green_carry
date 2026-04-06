import { useEffect, useState } from "react";
import styles from "./ManagerMenuEdit.module.css";
import { SearchIcon, X, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ManagerMenuEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuId = location.state?.menuId;
  const storeId = location.state?.storeId;

  const [searchTerm, setSearchTerm] = useState("");
  const [allOptions, setAllOptions] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);

  const [openSections, setOpenSections] = useState({
    size: false,
    eco: false,
    general: false,
  });

  // location.state로 넘어온 menuData가 있으면 그걸 쓰고, 없으면 빈 값으로 세팅
  const initialMenuData = location.state?.menuData || null;

  const [menu, setMenu] = useState({
    menuName: initialMenuData ? initialMenuData.menuName : "",
    menuInfo: initialMenuData ? initialMenuData.menuInfo : "",
    menuImage: initialMenuData ? initialMenuData.menuImage : null,
    menuPrice: initialMenuData ? initialMenuData.menuPrice : "",
    menuCategory: initialMenuData ? initialMenuData.menuCategory : "메인",
  });

  const [selectedOptionIds, setSelectedOptionIds] = useState([]);

  // 💡 사용자가 직접 추가한 새 옵션 배열
  const [newOptions, setNewOptions] = useState([]);

  // 💡 [수정됨] 사이즈 옵션과 일반 옵션의 입력 State 완전 분리!
  const [tempSize, setTempSize] = useState({ name: "", price: "" });
  const [tempGeneral, setTempGeneral] = useState({ name: "", price: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenu({ ...menu, [name]: value });
  };

  useEffect(() => {
    // 1. 전체 옵션 목록 로드 (공통)
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/options/all`)
      .then((res) => setAllOptions(res.data))
      .catch((err) => console.error("전체 옵션 로드 실패:", err));

    // 2. 수정 모드 (menuId가 있을 때) 기존 데이터 불러오기
    if (menuId) {
      // 2-1. 해당 메뉴의 기본 정보(이름, 가격 등) 불러오기
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/stores/menu/${menuId}`)
        .then((res) => {
          const data = res.data;
          setMenu({
            menuName: data.menuName || "",
            menuInfo: data.menuInfo || "",
            menuImage: data.menuImage || null,
            menuPrice: data.menuPrice || "",
            menuCategory: data.menuCategory || "메인",
          });
        })
        .catch((err) => console.error("메뉴 기본 정보 로드 실패:", err));

      // 2-2. 해당 메뉴에 체크되어 있던 기존 옵션들 불러오기
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/stores/${menuId}/options`)
        .then((res) => {
          // 백엔드에서 받아온 옵션 객체 배열에서 'optionNo'만 쏙 뽑아서 배열로 만듦
          const mappedIds = res.data.map((opt) => opt.optionNo);
          setSelectedOptionIds(mappedIds); // 👈 뱃지랑 체크박스에 자동으로 불이 들어옴!
        })
        .catch((err) => console.error("기존 매핑 옵션 로드 실패:", err));
    }
  }, [menuId]);

  const containerList = allOptions.filter((opt) => opt.optionType === 1);
  const generalList = allOptions.filter((opt) => opt.optionType === 2);
  const ecoList = allOptions.filter((opt) => opt.optionType === 3);

  // 기존 DB 옵션 토글
  const toggleOption = (optionId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
    setSearchTerm("");
  };

  // 💡 새 옵션 추가 함수 (1: 사이즈, 2: 일반)
  const handleAddNewOption = (type) => {
    const currentTemp = type === 1 ? tempSize : tempGeneral;

    if (!currentTemp.name || !currentTemp.price) {
      alert("옵션 이름과 가격을 모두 입력해주세요.");
      return;
    }

    const newItem = {
      optionName: currentTemp.name,
      optionPrice: Number(currentTemp.price),
      optionType: type,
      isNew: true,
    };

    setNewOptions([...newOptions, newItem]);

    // 입력창 초기화
    if (type === 1) setTempSize({ name: "", price: "" });
    else setTempGeneral({ name: "", price: "" });
  };

  // 💡 새로 추가한 옵션 삭제
  const removeNewOption = (indexToRemove) => {
    setNewOptions(newOptions.filter((_, index) => index !== indexToRemove));
  };

  // 💡 최종 저장 (백엔드로 전송)
  const handleSave = () => {
    const finalData = {
      ...menu,
      storeId,
      menuId,
      optionIds: selectedOptionIds, // 체크박스/검색으로 선택한 기존 옵션 ID들
      newOptions: newOptions, // 새로 입력해서 추가한 객체 배열
    };

    const method = menuId ? "put" : "post";
    const url = menuId ? `/stores/menus/${menuId}` : "/stores";

    axios[method](`${import.meta.env.VITE_BACKSERVER}${url}`, finalData)
      .then(() => {
        alert("저장되었습니다.");
        navigate(-1);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className={styles.page_container}>
      <div className={styles.edit_box}>
        {/* 상단: 입력 폼 & 사진 */}
        <div className={styles.top_content}>
          <div className={styles.form_section}>
            <div className={styles.input_row}>
              <label>메뉴이름</label>
              <input
                name="menuName"
                className={styles.input_field}
                value={menu.menuName}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.input_row}>
              <label>메뉴설명</label>
              <input
                name="menuInfo"
                className={styles.input_field}
                value={menu.menuInfo}
                onChange={handleInputChange}
              />
            </div>

            {/* 💡 기존 용기 설정 (그대로 유지) */}
            <div className={styles.input_row}>
              <label>용기 설정</label>
              <div className={styles.search_container}>
                <div className={styles.search_bar}>
                  <input
                    type="text"
                    placeholder="예) 사각용기(소)"
                    value={searchTerm}
                    onFocus={() => setIsListOpen(true)}
                    onBlur={() => setTimeout(() => setIsListOpen(false), 200)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon size={18} className={styles.search_icon} />
                  {isListOpen && (
                    <ul className={styles.dropdown}>
                      {containerList
                        .filter((c) =>
                          searchTerm === ""
                            ? true
                            : c.optionName.includes(searchTerm),
                        )
                        .map((c) => (
                          <li
                            key={c.optionNo}
                            onMouseDown={() => toggleOption(c.optionNo)}
                          >
                            {c.optionName} (+{c.optionPrice}원)
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                <div className={styles.badge_list}>
                  {allOptions
                    .filter(
                      (opt) =>
                        opt.optionType === 1 &&
                        selectedOptionIds.includes(opt.optionNo),
                    )
                    .map((c) => (
                      <div key={c.optionNo} className={styles.badge_item}>
                        <X size={14} onClick={() => toggleOption(c.optionNo)} />
                        {c.optionName} <span>1</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className={styles.input_row}>
              <label>카테고리</label>
              <select
                name="menuCategory"
                className={styles.select_field}
                value={menu.menuCategory}
                onChange={handleInputChange}
              >
                <option value="메인">메인</option>
                <option value="사이드">사이드</option>
                <option value="음료">음료</option>
              </select>
            </div>

            <div className={styles.input_row}>
              <label>가격</label>
              <input
                name="menuPrice"
                className={styles.input_field}
                value={menu.menuPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles.image_section}>
            <div className={styles.upload_card}>
              <p className={styles.up_text}>메뉴 사진 업로드</p>
              <p className={styles.up_hint}>PNG, JPG, GIF up to 5MB</p>
              <label htmlFor="menu-file" className={styles.browse_button}>
                <Upload size={16} /> Browse Files
              </label>
              <input id="menu-file" type="file" style={{ display: "none" }} />
            </div>
          </div>
        </div>

        {/* 하단: 아코디언 옵션 */}
        <h3 className={styles.sub_title}>추가 옵션</h3>

        {/* 1. 사이즈 옵션 아코디언 (직접 입력 추가) */}
        <div className={styles.accordion_group}>
          <div
            className={styles.group_header}
            onClick={() =>
              setOpenSections({ ...openSections, size: !openSections.size })
            }
          >
            <div className={styles.group_label}>
              <X size={16} className={styles.acc_icon} /> 사이즈 옵션
            </div>
            {openSections.size ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
          {openSections.size && (
            <div className={styles.group_body}>
              <div className={styles.add_form}>
                <span>옵션이름</span>
                <input
                  className={styles.small_input}
                  value={tempSize.name}
                  onChange={(e) =>
                    setTempSize({ ...tempSize, name: e.target.value })
                  }
                />
                <span>옵션 가격</span>
                <input
                  type="number"
                  className={styles.small_input}
                  value={tempSize.price}
                  onChange={(e) =>
                    setTempSize({ ...tempSize, price: e.target.value })
                  }
                />
                <button
                  className={styles.add_item_btn}
                  onClick={() => handleAddNewOption(1)}
                >
                  추가
                </button>
              </div>
              <p className={styles.opt_desc}>옵션 설명</p>
              <div className={styles.badge_wrap}>
                {newOptions
                  .filter((o) => o.optionType === 1)
                  .map((opt, i) => (
                    <span key={i} className={styles.new_opt_badge}>
                      <X
                        size={14}
                        className={styles.badge_x}
                        onClick={() => removeNewOption(i)}
                      />
                      {opt.optionName} {opt.optionPrice.toLocaleString()}원
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. 에코포인트 옵션 아코디언 */}
        <div className={styles.accordion_group}>
          <div
            className={styles.group_header}
            onClick={() =>
              setOpenSections({ ...openSections, eco: !openSections.eco })
            }
          >
            <div className={styles.group_label}>
              <X size={16} className={styles.acc_icon} /> 에코포인트 옵션
            </div>
            {openSections.eco ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
          {openSections.eco && (
            <div className={styles.group_body}>
              <div className={styles.checkbox_wrap}>
                {ecoList.map((opt) => (
                  <label key={opt.optionNo} className={styles.check_label}>
                    <input
                      type="checkbox"
                      checked={selectedOptionIds.includes(opt.optionNo)}
                      onChange={() => toggleOption(opt.optionNo)}
                    />
                    {opt.optionName}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. 일반 옵션 아코디언 */}
        <div className={styles.accordion_group}>
          <div
            className={styles.group_header}
            onClick={() =>
              setOpenSections({
                ...openSections,
                general: !openSections.general,
              })
            }
          >
            <div className={styles.group_label}>
              <X size={16} className={styles.acc_icon} /> 일반 옵션
            </div>
            {openSections.general ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
          {openSections.general && (
            <div className={styles.group_body}>
              {/* A. 직접 입력해서 추가하는 폼 (이미 만드신 것) */}
              <div className={styles.add_form}>
                <span>옵션이름</span>
                <input
                  className={styles.small_input}
                  value={tempGeneral.name}
                  onChange={(e) =>
                    setTempGeneral({ ...tempGeneral, name: e.target.value })
                  }
                />
                <span>옵션 가격</span>
                <input
                  type="number"
                  className={styles.small_input}
                  value={tempGeneral.price}
                  onChange={(e) =>
                    setTempGeneral({ ...tempGeneral, price: e.target.value })
                  }
                />
                <button
                  className={styles.add_item_btn}
                  onClick={() => handleAddNewOption(2)}
                >
                  추가
                </button>
              </div>

              {/* B. [추가됨] 기존 DB에 저장된 일반 옵션들 (체크박스 리스트) */}
              <div
                className={styles.checkbox_wrap}
                style={{
                  marginBottom: "20px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "15px",
                }}
              >
                {generalList.length > 0 ? (
                  generalList.map((opt) => (
                    <label key={opt.optionNo} className={styles.check_label}>
                      <input
                        type="checkbox"
                        checked={selectedOptionIds.includes(opt.optionNo)}
                        onChange={() => toggleOption(opt.optionNo)}
                      />
                      {opt.optionName} (+{opt.optionPrice}원)
                    </label>
                  ))
                ) : (
                  <p style={{ fontSize: "14px", color: "#999" }}>
                    등록된 일반 옵션이 없습니다.
                  </p>
                )}
              </div>

              <div className={styles.badge_wrap}>
                {newOptions
                  .filter((o) => o.optionType === 2)
                  .map((opt, i) => (
                    <span key={i} className={styles.new_opt_badge}>
                      <X
                        size={14}
                        className={styles.badge_x}
                        onClick={() => removeNewOption(i)}
                      />
                      {opt.optionName} {opt.optionPrice.toLocaleString()}원
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className={styles.btn_area}>
          <button className={styles.green_btn} onClick={handleSave}>
            저장
          </button>
          <button className={styles.cancel_btn} onClick={() => navigate(-1)}>
            취소
          </button>
          <button className={styles.delete_btn}>삭제</button>
        </div>
      </div>
    </div>
  );
};

export default ManagerMenuEdit;
