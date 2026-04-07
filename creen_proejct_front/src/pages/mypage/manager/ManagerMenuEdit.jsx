import { useEffect, useState } from 'react';
import styles from './ManagerMenuEdit.module.css';
import {
  SearchIcon,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Plus,
  Minus,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ManagerMenuEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId, menuId } = useParams();

  console.log('현재 가게 ID:', storeId);
  console.log('현재 메뉴 ID:', menuId);

  console.log('🚀 ~ ManagerMenuEdit ~ menuId:', menuId);
  console.log('🚀 ~ ManagerMenuEdit ~ storeId:', storeId);

  // --- [State] 기본 정보 ---
  const initialMenuData = location.state?.menuData || null;
  const [menu, setMenu] = useState({
    menuName: initialMenuData ? initialMenuData.menuName : '',
    menuInfo: initialMenuData ? initialMenuData.menuInfo : '',
    menuImage: initialMenuData ? initialMenuData.menuImage : null,
    menuPrice: initialMenuData ? initialMenuData.menuPrice : '',
    menuCategory: initialMenuData ? initialMenuData.menuCategory : '메인',
  });

  // --- [State] 용기 설정 ---
  const [containerMaster, setContainerMaster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState([]);

  // --- [State] 옵션 설정 ---
  const [allOptions, setAllOptions] = useState([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [newOptions, setNewOptions] = useState([]);
  const [tempSize, setTempSize] = useState({ name: '', price: '' });
  const [tempGeneral, setTempGeneral] = useState({ name: '', price: '' });

  const [openSections, setOpenSections] = useState({
    size: true,
    general: false,
    eco: false,
  });

  // --- [Effect] 데이터 로드 ---
  useEffect(() => {
    // if (!storeId || storeId === 'undefined') {
    //   alert(
    //     '가게 정보(storeId)가 없습니다. 목록으로 돌아가서 다시 시도해주세요.',
    //   );
    //   navigate('/');
    //   return;
    // }

    // 1. 용기 마스터 목록 로드
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/menus/containers`)
      .then((res) => {
        console.log('🚀 ~ ManagerMenuEdit ~ res:', res.data);

        setContainerMaster(res.data);
      })
      .catch((err) => console.error('용기 데이터 로드 실패', err));

    // 2. 전체 옵션 목록 로드
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/stores/options/all`)
      .then((res) => setAllOptions(res.data))
      .catch((err) => console.error('전체 옵션 로드 실패:', err));

    // 3. 수정 모드 데이터 로드
    if (menuId) {
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/stores/menu/${menuId}`)
        .then((res) => setMenu(res.data));
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/stores/${menuId}/options`)
        .then((res) =>
          setSelectedOptionIds(res.data.map((opt) => opt.optionNo)),
        );
      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/stores/${menuId}/containers`)
        .then((res) => {
          setSelectedContainers(
            res.data.map((item) => ({
              productId: item.productId,
              name: item.productMaterial,
              count: item.containerCount,
            })),
          );
        });
    }
  }, [menuId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'menuPrice')
      setMenu({ ...menu, [name]: value.replace(/[^0-9]/g, '') });
    else setMenu({ ...menu, [name]: value });
  };

  const addContainer = (target) => {
    if (selectedContainers.find((c) => c.productId === target.productId))
      return alert('이미 추가된 용기입니다.');
    setSelectedContainers([
      ...selectedContainers,
      { productId: target.productId, name: target.productMaterial, count: 1 },
    ]);
    setSearchTerm('');
    setIsListOpen(false);
  };

  const handleSave = () => {
    const finalData = {
      ...menu,
      storeId,
      menuId,
      optionIds: selectedOptionIds,
      newOptions,
      containerMap: selectedContainers.map((c) => ({
        productId: c.productId,
        count: c.count,
      })),
    };
    const method = menuId ? 'put' : 'post';
    const url = menuId ? `/menus/${storeId}/${menuId}` : `/menus/${storeId}`;
    axios[method](`${import.meta.env.VITE_BACKSERVER}${url}`, finalData).then(
      () => {
        alert('저장되었습니다.');
        navigate(-1);
      },
    );
  };

  const generalList = allOptions.filter((o) => o.optionType === 2);
  const ecoList = allOptions.filter((o) => o.optionType === 3);

  return (
    <div className={styles.page_container}>
      <div className={styles.edit_box}>
        <h2 className={styles.main_title}>
          {menuId ? '메뉴 수정하기' : '새 메뉴 등록'}
        </h2>

        <div className={styles.top_content}>
          <div className={styles.form_section}>
            <div className={styles.input_row}>
              <label>메뉴이름</label>
              <input
                name="menuName"
                className={styles.input_field}
                value={menu.menuName}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="메뉴명을 입력하세요"
              />
            </div>
            <div className={styles.input_row}>
              <label>메뉴설명</label>
              <textarea
                name="menuInfo"
                className={styles.textarea_field}
                value={menu.menuInfo}
                onChange={handleInputChange}
                maxLength={1000}
                placeholder="메뉴 설명을 상세히 적어주세요"
              />
            </div>

            <div className={styles.input_row}>
              <label>용기 설정</label>
              <div className={styles.search_container}>
                <div className={styles.search_bar}>
                  <input
                    type="text"
                    placeholder="용기 재질 검색 (PP, 종이 등)"
                    value={searchTerm}
                    onFocus={() => setIsListOpen(true)}
                    onBlur={() => setTimeout(() => setIsListOpen(false), 200)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon size={18} className={styles.search_icon} />
                  {isListOpen && searchTerm && (
                    <ul className={styles.dropdown}>
                      {/* 💡 Array.isArray 체크를 추가하여 filter 에러를 방지합니다. */}
                      {Array.isArray(containerMaster) &&
                        containerMaster
                          .filter((c) =>
                            c.productMaterial
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          )
                          .map((c) => (
                            <li
                              key={c.productId}
                              onMouseDown={() => addContainer(c)}
                            >
                              {c.productMaterial}
                              <span className={styles.carbon_val}>
                                (탄소: {c.productEmissions}kg)
                              </span>
                            </li>
                          ))}
                    </ul>
                  )}
                </div>
                <div className={styles.selected_container_list}>
                  {selectedContainers.map((c) => (
                    <div key={c.productId} className={styles.container_item}>
                      <span className={styles.c_name}>{c.name}</span>
                      <div className={styles.c_controls}>
                        <button
                          onClick={() =>
                            setSelectedContainers((prev) =>
                              prev.map((item) =>
                                item.productId === c.productId
                                  ? {
                                      ...item,
                                      count: Math.max(1, item.count - 1),
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{c.count}개</span>
                        <button
                          onClick={() =>
                            setSelectedContainers((prev) =>
                              prev.map((item) =>
                                item.productId === c.productId
                                  ? { ...item, count: item.count + 1 }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <X
                        size={16}
                        className={styles.c_remove}
                        onClick={() =>
                          setSelectedContainers((prev) =>
                            prev.filter(
                              (item) => item.productId !== c.productId,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.input_row_group}>
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
                  placeholder="판매가 입력"
                />
              </div>
            </div>
          </div>

          <div className={styles.image_section}>
            <div className={styles.upload_card}>
              <p className={styles.up_text}>메뉴 사진</p>
              <label htmlFor="menu-file" className={styles.browse_button}>
                <Upload size={16} /> 사진 올리기
              </label>
              <input id="menu-file" type="file" style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        <h3 className={styles.sub_title}>옵션 설정</h3>

        {/* 1. 사이즈 / 2. 일반 / 3. 에코 순서 */}
        {[
          { t: '사이즈 옵션', k: 'size', l: [] },
          { t: '일반 옵션', k: 'general', l: generalList },
          { t: '에코포인트 옵션', k: 'eco', l: ecoList },
        ].map((sec, idx) => (
          <div className={styles.accordion_group} key={sec.k}>
            <div
              className={styles.group_header}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  [sec.k]: !openSections[sec.k],
                })
              }
            >
              <span>{sec.t}</span>{' '}
              {openSections[sec.k] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {openSections[sec.k] && (
              <div className={styles.group_body}>
                {sec.k !== 'eco' && (
                  <div className={styles.add_form}>
                    <input
                      placeholder="이름"
                      maxLength={30}
                      value={
                        sec.k === 'size' ? tempSize.name : tempGeneral.name
                      }
                      onChange={(e) =>
                        sec.k === 'size'
                          ? setTempSize({ ...tempSize, name: e.target.value })
                          : setTempGeneral({
                              ...tempGeneral,
                              name: e.target.value,
                            })
                      }
                    />
                    <input
                      placeholder="가격"
                      value={
                        sec.k === 'size' ? tempSize.price : tempGeneral.price
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        sec.k === 'size'
                          ? setTempSize({ ...tempSize, price: val })
                          : setTempGeneral({ ...tempGeneral, price: val });
                      }}
                    />
                    <button
                      onClick={() => {
                        const cur = sec.k === 'size' ? tempSize : tempGeneral;
                        if (!cur.name || !cur.price)
                          return alert('입력 정보를 확인하세요.');
                        setNewOptions([
                          ...newOptions,
                          {
                            optionName: cur.name,
                            optionPrice: Number(cur.price),
                            optionType: idx + 1,
                            isNew: true,
                          },
                        ]);
                        sec.k === 'size'
                          ? setTempSize({ name: '', price: '' })
                          : setTempGeneral({ name: '', price: '' });
                      }}
                    >
                      추가
                    </button>
                  </div>
                )}
                {sec.k === 'eco' && (
                  <div className={styles.eco_fixed_box}>
                    <label className={styles.check_item}>
                      <input
                        type="checkbox"
                        checked={selectedOptionIds.includes(5)}
                        onChange={() =>
                          setSelectedOptionIds((prev) =>
                            prev.includes(5)
                              ? prev.filter((i) => i !== 5)
                              : [...prev, 5],
                          )
                        }
                      />{' '}
                      <strong>기본 반찬 안 받기</strong>
                    </label>
                    <label className={styles.check_item}>
                      <input
                        type="checkbox"
                        checked={selectedOptionIds.includes(6)}
                        onChange={() =>
                          setSelectedOptionIds((prev) =>
                            prev.includes(6)
                              ? prev.filter((i) => i !== 6)
                              : [...prev, 6],
                          )
                        }
                      />{' '}
                      <strong>일회용품 안 받기</strong>
                    </label>
                  </div>
                )}
                <div
                  className={
                    sec.k === 'size' ? styles.badge_wrap : styles.checkbox_grid
                  }
                >
                  {sec.k === 'size'
                    ? newOptions
                        .filter((o) => o.optionType === 1)
                        .map((o, i) => (
                          <span key={i} className={styles.opt_badge}>
                            {o.optionName} (+{o.optionPrice}){' '}
                            <X
                              size={12}
                              onClick={() =>
                                setNewOptions(
                                  newOptions.filter((_, idx) => idx !== i),
                                )
                              }
                            />
                          </span>
                        ))
                    : sec.l
                        .filter((o) => o.optionNo !== 5 && o.optionNo !== 6)
                        .map((o) => (
                          <label key={o.optionNo} className={styles.check_item}>
                            <input
                              type="checkbox"
                              checked={selectedOptionIds.includes(o.optionNo)}
                              onChange={() =>
                                setSelectedOptionIds((prev) =>
                                  prev.includes(o.optionNo)
                                    ? prev.filter((i) => i !== o.optionNo)
                                    : [...prev, o.optionNo],
                                )
                              }
                            />{' '}
                            {o.optionName}{' '}
                            {o.optionPrice > 0 ? `(+${o.optionPrice})` : ''}
                          </label>
                        ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className={styles.btn_area}>
          <button className={styles.green_btn} onClick={handleSave}>
            저장하기
          </button>
          <button className={styles.cancel_btn} onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerMenuEdit;
