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
  // 💡 [수정/추가] 기존에 등록되어 있던 옵션 전체 정보를 담을 상태 추가
  const [existingOptions, setExistingOptions] = useState([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [newOptions, setNewOptions] = useState([]);

  // 옵션 추가 시 탄소값(carbon) 상태
  const [tempSize, setTempSize] = useState({ name: '', price: '', carbon: '' });
  const [tempGeneral, setTempGeneral] = useState({
    name: '',
    price: '',
    carbon: '',
  });

  const [openSections, setOpenSections] = useState({
    size: true,
    general: false,
    eco: false,
  });

  // 총 탄소 배출량 계산 로직 (선택된 용기 * 개수 * 용기별 탄소량)
  const totalCarbonEmission = selectedContainers.reduce((acc, cur) => {
    return acc + (cur.emissions || 0) * cur.count;
  }, 0);

  // --- [Effect] 데이터 로드 ---
  useEffect(() => {
    // 1. 용기 마스터 목록 로드
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/menus/containers`)
      .then((res) => {
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
        .get(`${import.meta.env.VITE_BACKSERVER}/menus/${menuId}`)
        .then((res) => setMenu(res.data));

      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/menus/${menuId}/options`)
        .then((res) => {
          // 💡 [수정/추가] 받아온 기존 옵션 데이터 전체를 existingOptions에 저장
          setExistingOptions(res.data);
          setSelectedOptionIds(res.data.map((opt) => opt.optionNo));
        });

      axios
        .get(`${import.meta.env.VITE_BACKSERVER}/menus/${menuId}/containers`)
        .then((res) => {
          setSelectedContainers(
            res.data.map((item) => ({
              productId: item.productId,
              name: item.productMaterial,
              count: item.containerCount,
              emissions: item.productEmissions || 0,
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
      {
        productId: target.productId,
        name: target.productMaterial,
        count: 1,
        emissions: target.productEmissions || 0,
      },
    ]);
    setSearchTerm('');
    setIsListOpen(false);
  };

  const handleSave = () => {
    const finalData = {
      ...menu,
      menuPrice: Number(menu.menuPrice),
      storeId,
      menuId,
      menuCarbon: totalCarbonEmission,
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
              <label
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>용기 설정</span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: '#10b981',
                    fontWeight: 'bold',
                  }}
                >
                  예상 총 탄소 배출량: {totalCarbonEmission.toFixed(2)} kg
                </span>
              </label>
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
                    <input
                      type="number"
                      step="0.01"
                      placeholder="탄소량(kg)"
                      style={{ width: '80px' }}
                      value={
                        sec.k === 'size' ? tempSize.carbon : tempGeneral.carbon
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        sec.k === 'size'
                          ? setTempSize({ ...tempSize, carbon: val })
                          : setTempGeneral({ ...tempGeneral, carbon: val });
                      }}
                    />
                    <button
                      onClick={() => {
                        const cur = sec.k === 'size' ? tempSize : tempGeneral;
                        if (!cur.name || !cur.price || cur.carbon === '')
                          return alert('이름, 가격, 탄소량을 모두 입력하세요.');

                        setNewOptions([
                          ...newOptions,
                          {
                            optionName: cur.name,
                            optionPrice: Number(cur.price),
                            optionCarbon: Number(cur.carbon),
                            optionType: idx + 1,
                            isNew: true,
                          },
                        ]);
                        sec.k === 'size'
                          ? setTempSize({ name: '', price: '', carbon: '' })
                          : setTempGeneral({ name: '', price: '', carbon: '' });
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
                  {sec.k === 'size' ? (
                    <>
                      {/* 💡 [수정/추가] 백엔드에서 가져온 기존 사이즈 옵션 렌더링 */}
                      {existingOptions
                        .filter((o) => o.optionType === 1)
                        .map((o) => (
                          <span
                            key={`ex-size-${o.optionNo}`}
                            className={styles.opt_badge}
                          >
                            {o.optionName} (+{o.optionPrice}원 / 🌿{' '}
                            {o.optionCarbon || 0}kg){' '}
                            <X
                              size={12}
                              onClick={() => {
                                // 화면에서도 지우고, selectedOptionIds 에서도 제거하여 서버로 안 넘어가게 함
                                setExistingOptions((prev) =>
                                  prev.filter(
                                    (item) => item.optionNo !== o.optionNo,
                                  ),
                                );
                                setSelectedOptionIds((prev) =>
                                  prev.filter((id) => id !== o.optionNo),
                                );
                              }}
                            />
                          </span>
                        ))}

                      {/* 새로 추가하는 사이즈 옵션 */}
                      {newOptions
                        .filter((o) => o.optionType === 1)
                        .map((o, i) => (
                          <span
                            key={`new-size-${i}`}
                            className={styles.opt_badge}
                          >
                            {o.optionName} (+{o.optionPrice}원 / 🌿{' '}
                            {o.optionCarbon}kg){' '}
                            <X
                              size={12}
                              onClick={() =>
                                setNewOptions(
                                  newOptions.filter((item) => item !== o),
                                )
                              }
                            />
                          </span>
                        ))}
                    </>
                  ) : (
                    sec.l
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
                      ))
                  )}
                </div>

                {sec.k === 'general' && (
                  <div
                    className={styles.badge_wrap}
                    style={{ marginTop: '12px' }}
                  >
                    {/* 💡 [수정/추가] 기존에 등록되었던 커스텀 일반 옵션 렌더링 (전체 옵션에 없는 애들만 배지로 표시) */}
                    {existingOptions
                      .filter(
                        (o) =>
                          o.optionType === 2 &&
                          !generalList.some((g) => g.optionNo === o.optionNo),
                      )
                      .map((o) => (
                        <span
                          key={`ex-gen-${o.optionNo}`}
                          className={styles.opt_badge}
                        >
                          {o.optionName} (+{o.optionPrice}원 / 🌿{' '}
                          {o.optionCarbon || 0}kg){' '}
                          <X
                            size={12}
                            onClick={() => {
                              setExistingOptions((prev) =>
                                prev.filter(
                                  (item) => item.optionNo !== o.optionNo,
                                ),
                              );
                              setSelectedOptionIds((prev) =>
                                prev.filter((id) => id !== o.optionNo),
                              );
                            }}
                          />
                        </span>
                      ))}

                    {/* 새로 추가하는 커스텀 일반 옵션 */}
                    {newOptions
                      .filter((o) => o.optionType === 2)
                      .map((o, i) => (
                        <span key={`new-gen-${i}`} className={styles.opt_badge}>
                          {o.optionName} (+{o.optionPrice}원 / 🌿{' '}
                          {o.optionCarbon}kg){' '}
                          <X
                            size={12}
                            onClick={() =>
                              setNewOptions(
                                newOptions.filter((item) => item !== o),
                              )
                            }
                          />
                        </span>
                      ))}
                  </div>
                )}
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
