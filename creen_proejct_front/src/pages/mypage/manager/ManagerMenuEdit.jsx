import styles from "./ManagermenuEdit.module.css";

const ManagermenuEdit = () => {
  return (
    <div className={styles.menu_edit_container}>
      <div>
        <div className={styles.menu_main_edit}>
          <label>메뉴 이름</label>
          <input />
          <label>메뉴 설명</label>
          <input />
          <label>용기 설정</label>
          <div className={styles.search_wrap}>
            <input
              type="search"
              className={styles.search_input}
              placeholder="메뉴이름"
              value={searchTerm}
              //onChange={(e) => setSearchTerm(e.target.value)}
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
