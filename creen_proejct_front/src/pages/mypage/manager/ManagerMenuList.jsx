import SearchIcon from "@mui/icons-material/Search";
import styles from "./ManagerMenuList.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import axios from "axios";

const ManagerMenuList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [menuList, setMenuList] = useState([]);
  const [menuId, setMenuId] = useState("");
  const [storeId, setStoreId] = useState("");

  useEffect(() => {
    const memberId = localStorage.getItem("memberId");

    if (!memberId) {
      console.warn("로그인 정보(memberId)가 없습니다.");
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/store/myStore?memberId=${memberId}`,
      )
      .then((Res) => {
        const fetchedStoreId = Res.data.storeId;
        setStoreId(fetchedStoreId);

        if (!fetchedStoreId) {
          console.warn("해당 유저의 상점 정보가 없습니다.");
          return;
        }

        axios
          .get(
            `${import.meta.env.VITE_BACKSERVER}/stores/${fetchedStoreId}/menus`,
          )
          .then((res) => {
            console.log("메뉴 확인", res.data);
            setMenuList(res.data);
          })
          .catch((err) => {
            console.log("데이터 로딩 에러:", err);
          });
      })
      .catch((err) => {
        console.error("상점 정보 로딩 중 에러 발생:", err);
      });
  }, []);

  const searchMenus = menuList.filter((menu) =>
    menu.menuName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.menu_list_container}>
      <div className={styles.menu_header}>
        <h3 className={styles.store_name}>지웅이네 김치찜</h3>
        <div className={styles.search_wrap}>
          <input
            type="search"
            className={styles.search_input}
            placeholder="메뉴이름"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className={styles.search_icon} />
        </div>
        <div>
          <button
            onClick={() => {
              navigate("/mypage/manager/menuEdit", {
                state: { storeId: storeId },
              });
            }}
          >
            메뉴 추가
          </button>
        </div>
      </div>

      <div className={styles.menu_grid}>
        {searchMenus.map((menu) => (
          <div
            key={menu.menuId}
            className={styles.menu_card}
            onClick={() => {
              (setMenuId(menu.menuId),
                navigate("/mypage/manager/menuEdit", {
                  state: { menuId: menu.menuId },
                }));
            }}
          >
            <div className={styles.menu_image}>
              {menu.menuImage && (
                <img
                  src={menu.menuImage}
                  alt={menu.menuName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
            <div className={styles.menu_info}>
              <span className={styles.menu_title}>{menu.menuName}</span>
              <p className={styles.menu_price}>
                {menu.menuPrice.toLocaleString() || 0}원
              </p>
              {menu.menuInfo && (
                <p
                  className={styles.menu_desc}
                  style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}
                >
                  {menu.menuInfo}
                </p>
              )}
            </div>
          </div>
        ))}
        {searchMenus.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
            해당 메뉴가 없습니다.
          </p>
        )}
      </div>

      <div className={styles.pagination}>
        <button className={styles.page_btn_nav}>
          <ChevronLeftIcon fontSize="small" /> Previous
        </button>
        <div className={styles.page_numbers}>
          <button className={`${styles.page_num} ${styles.active}`}>01</button>
        </div>
        <button className={styles.page_btn_nav}>
          Next <ChevronRightIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default ManagerMenuList;
