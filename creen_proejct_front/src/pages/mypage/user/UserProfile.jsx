import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./UserProfile.module.css";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Collapse from "@mui/material/Collapse";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import axios from "axios";

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [point, setPoint] = useState(0);
  const [communityPoint, setCommunityPoint] = useState(0);
  const [pointHistory, setPointHistory] = useState([]); // 🌟 내역 리스트용 상태만 추가

  const [openEco, setOpenEco] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [progress, setProgress] = useState(0);

  const backHost = import.meta.env.VITE_BACKSERVER;

  const toggleEco = () => setOpenEco(!openEco);
  const toggleHistory = () => setOpenHistory(!openHistory);

  const getEcoGrade = (currentPoint) => {
    if (currentPoint < 1000) return { name: "꼬마 씨앗 🌰", next: 1000 };
    if (currentPoint < 3000) return { name: "파릇파릇 새싹 🌱", next: 3000 };
    if (currentPoint < 6600) return { name: "무럭무럭 묘목 🌿", next: 6600 };
    if (currentPoint < 10000) return { name: "든든한 나무 🌳", next: 10000 };
    return { name: "울창한 숲 🌲", next: null };
  };

  const myGradeInfo = getEcoGrade(point);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.memberId) {
        try {
          const token = localStorage.getItem("accessToken");
          const config = { headers: { Authorization: `Bearer ${token}` } };

          // 1. 기존 포인트 로직 (절대 수정 금지)
          const pointRes = await axios.get(`${backHost}/member/total-carbon`, {
            params: { memberId: user.memberId },
            ...config,
          });
          setPoint(pointRes.data);

          // 2. 커뮤니티 포인트 (기존 로직)
          const commRes = await axios.get(
            `${backHost}/member/community-carbon`,
          );
          setCommunityPoint(commRes.data);

          // 3. 🌟 새로 추가된 '내역' 리스트만 가져오기
          const historyRes = await axios.get(
            `${backHost}/member/point-history/${user.memberId}`,
            config,
          );
          setPointHistory(historyRes.data);
        } catch (err) {
          console.error("데이터 로딩 실패", err);
        }
      }
    };
    fetchUserData();
  }, [user, backHost]);

  useEffect(() => {
    const targetPoint = 10000;
    const calculatedPercent = Math.min((point / targetPoint) * 100, 100);
    const timer = setTimeout(() => setProgress(calculatedPercent), 100);
    return () => clearTimeout(timer);
  }, [point]);

  return (
    <div className={styles.right}>
      <div className={styles.user_grade}>
        <div className={styles.ecoGrade}>
          <div className={styles.grade_header}>
            <WorkspacePremiumIcon />
            <span className={styles.grade_title}>나의 에코 등급</span>
          </div>
          <div className={styles.grade_body}>
            <h2 className={styles.grade_name}>{myGradeInfo.name}</h2>
            <p className={styles.grade_subtitle}>
              {myGradeInfo.next
                ? `다음 레벨까지 ${(myGradeInfo.next - point).toLocaleString()}g`
                : "🎉 최고 등급 달성!"}
            </p>
          </div>
        </div>

        <section className={styles.right_main}>
          <div className={styles.icon_content}>
            <div className={styles.icon}>
              <EnergySavingsLeafIcon />
            </div>
            <div className={styles.dashboard}>
              <p className={styles.dashboard_title}>나의 탄소 절감량</p>
              <p className={styles.dashboard_value}>
                {point.toLocaleString()}g
              </p>
              <p className={styles.dashbboard_subtitle}>나의 총 실천 기록</p>
            </div>
          </div>
          <div className={styles.icon_content}>
            <div className={styles.icon}>
              <Diversity1Icon />
            </div>
            <div className={styles.dashboard}>
              <p className={styles.dashboard_title}>커뮤니티가 절약한 탄소</p>
              <p className={styles.dashboard_value}>
                {(communityPoint / 1000).toFixed(1)}kg
              </p>
              <p className={styles.dashbboard_subtitle}>CO2</p>
            </div>
          </div>
          <div className={styles.gauge_container}>
            <div className={styles.gauge_bg}>
              <div
                className={styles.gauge_fill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={styles.gauge_info}>
              <span>🌳 나무 {(point / 6600).toFixed(2)} 그루 상당</span>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.right_sub}>
        <div className={styles.my_point}>
          <span>에코 포인트</span>
          <p>보유 포인트 : {point.toLocaleString()}P</p>
        </div>

        <div className={styles.collapse_wrapper}>
          <div className={styles.collapse_header} onClick={toggleEco}>
            <p>에코 포인트란?</p>
            <div className={styles.my_icon}>
              {openEco ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
            </div>
          </div>
          <Collapse in={openEco} timeout="auto" unmountOnExit>
            <div className={styles.eco_content_box}>
              <p>
                에코 포인트는 친환경 배달을 선택할 때 적립되는 포인트입니다.
              </p>
              <p className={styles.eco_slogan}>
                🌱 작은 선택이 지구를 바꿉니다.
              </p>
            </div>
          </Collapse>
        </div>

        {/* 🌟 적립 내역 리스트 (포인트 로직은 건드리지 않고 출력만 수행) */}
        <div className={styles.collapse_wrapper}>
          <div className={styles.collapse_header} onClick={toggleHistory}>
            <p>
              적립 내역{" "}
              <span className={styles.history_sub}>최근 3개월 적립 내역</span>
            </p>
            <div className={styles.hs_icon}>
              {openHistory ? (
                <KeyboardArrowDownIcon />
              ) : (
                <ArrowForwardIosIcon />
              )}
            </div>
          </div>
          <Collapse in={openHistory} timeout="auto" unmountOnExit>
            <div className={styles.history_list}>
              {pointHistory.length > 0 ? (
                pointHistory.map((item) => (
                  <div key={item.orderId} className={styles.history_item}>
                    <div className={styles.history_left}>
                      <StorefrontIcon className={styles.store_icon} />
                      <div>
                        <div>{item.storeName}</div>
                        <div className={styles.history_date}>
                          {item.orderDate}
                        </div>
                      </div>
                    </div>
                    <span className={styles.plus_point}>
                      +{item.pointAmount.toLocaleString()}P
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#999",
                  }}
                >
                  최근 내역이 없습니다. 🌱
                </div>
              )}
            </div>
          </Collapse>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
