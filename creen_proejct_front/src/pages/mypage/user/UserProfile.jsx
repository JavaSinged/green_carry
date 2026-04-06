import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./UserProfile.module.css";
import Diversity1Icon from '@mui/icons-material/Diversity1';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StorefrontIcon from '@mui/icons-material/Storefront'; // 가게 아이콘
import Collapse from '@mui/material/Collapse';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import axios from "axios";

const UserProfile = () => {
    const { user } = useContext(AuthContext); // 로그인 유저 정보
    const [point, setPoint] = useState(0);
    const [communityPoint, setCommunityPoint] = useState(0);
    const carbonSt = {
        title: "커뮤니티가 절약한 탄소",
        value: (communityPoint / 1000).toFixed(1),
        unit: "kg",
        subText: "CO2"
    };
    const myCarbonSt = {
        title: "나의 탄소 절감량",
        value: point.toLocaleString(),
        unit: "g",
        subText: "나의 총 실천 기록"
    };
    const [openEco, setOpenEco] = useState(false);
    const [openHistory, setOpenHistory] = useState(false);
    const [progress, setProgress] = useState(0);

    const toggleEco = () => setOpenEco(!openEco);
    const toggleHistory = () => setOpenHistory(!openHistory);

    // 현재 포인트를 넣으면 등급 정보를 반환
    const getEcoGrade = (currentPoint) => {
        if (currentPoint < 1000) return { name: "꼬마 씨앗 🌰", next: 1000 };
        if (currentPoint < 3000) return { name: "파릇파릇 새싹 🌱", next: 3000 };
        if (currentPoint < 6600) return { name: "무럭무럭 묘목 🌿", next: 6600 };
        if (currentPoint < 10000) return { name: "든든한 나무 🌳", next: 10000 };
        return { name: "울창한 숲 🌲", next: null, color: '##2ECC71' }; // 만렙
    };
    const myGradeInfo = getEcoGrade(point);


    /* [ 게이지 바 계산 로직 안내 ]
        1. 현재 탄소 절감량 (current)과 목표량 (target)을 정의합니다.
        2. 공식: (현재량 / 목표량) * 100 = 퍼센트(%)
        3. Math.min(값, 100): 계산된 값이 100을 넘더라도 게이지가 뚫고 나가지 않게 최대치를 100으로 고정합니다.
    */

    useEffect(() => {
        const fetchUserPoint = async () => {
            if (user?.memberId) {
                try {
                    const token = localStorage.getItem("accessToken");
                    const response = await axios.get(
                        `${import.meta.env.VITE_BACKSERVER}/member/total-carbon`,
                        {
                            params: { memberId: user.memberId },
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    setPoint(response.data);
                } catch (err) {
                    console.error("포인트 로딩 실패", err);
                }
            }
            try {
                const commRes = await axios.get(
                    `${import.meta.env.VITE_BACKSERVER}/member/community-carbon`
                );
                setCommunityPoint(commRes.data);
            } catch (err) {
                console.error("커뮤니티 포인트 로딩 실패", err);
            }
        };
        fetchUserPoint();
    }, [user]);
    useEffect(() => {
        const targetPoint = 10000;
        const calculatedPercent = Math.min((point / targetPoint) * 100, 100);
        const timer = setTimeout(() => {
            setProgress(calculatedPercent);
        }, 100);
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
                        <h2 className={styles.grade_name}>
                            {myGradeInfo.name}
                        </h2>
                        <p className={styles.grade_subtitle}>
                            {myGradeInfo.next
                                ? `다음 레벨까지 ${(myGradeInfo.next - point).toLocaleString()}g`
                                : "🎉 최고 등급 달성!"}
                        </p>
                    </div>
                </div>

                <section className={styles.right_main}>
                    <div className={styles.icon_content}>
                        <div className={styles.icon}><EnergySavingsLeafIcon /></div>
                        <div className={styles.dashboard}>
                            <p className={styles.dashboard_title}>{myCarbonSt.title}</p>
                            <p className={styles.dashboard_value}>{myCarbonSt.value}{myCarbonSt.unit}</p>
                            <p className={styles.dashbboard_subtitle}>{myCarbonSt.subText}</p>
                        </div>
                    </div>
                    <div className={styles.icon_content}>
                        <div className={styles.icon}><Diversity1Icon /></div>
                        <div className={styles.dashboard}>
                            <p className={styles.dashboard_title}>{carbonSt.title}</p>
                            <p className={styles.dashboard_value}>{carbonSt.value}{carbonSt.unit}</p>
                            <p className={styles.dashbboard_subtitle}>{carbonSt.subText}</p>
                        </div>
                    </div>
                    <div className={styles.gauge_container}>
                        <div className={styles.gauge_bg}>
                            {/* 게이지 채워지는 비율 (style width로 조절) */}
                            <div className={styles.gauge_fill} style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className={styles.gauge_info}>
                            {/* 실제 포인트에 따른 나무 그루 수 계산 적용 */}
                            <span>🌳 나무 {(point / 6600).toFixed(2)} 그루 상당</span>
                        </div>
                    </div>
                </section>
            </div>
            {/* 하단 에코 */}
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
                            <p>에코 포인트는 친환경 배달을 선택할 때 적립되는 포인트입니다.</p>
                            <p>배달 거리와 이동 수단에 따라 탄소 절감량이 계산되며,<br />그에 따라 포인트가 지급됩니다.</p>
                            <p>적립된 포인트는 할인 및 다양한 혜택으로 사용할 수 있습니다.</p>
                            <p className={styles.eco_slogan}>🌱 작은 선택이 지구를 바꿉니다.</p>
                        </div>
                    </Collapse>
                </div>

                <div className={styles.collapse_wrapper}>
                    <div className={styles.collapse_header} onClick={toggleHistory}>
                        <p>적립 내역 <span className={styles.history_sub}>최근 3개월 적립 내역</span></p>
                        <div className={styles.hs_icon}>
                            {openHistory ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
                        </div>
                    </div>
                    <Collapse in={openHistory} timeout="auto" unmountOnExit>
                        <div className={styles.history_list}>
                            <div className={styles.history_item}>
                                <div className={styles.history_left}>
                                    <StorefrontIcon className={styles.store_icon} />
                                    <span>친환경 배달 실천</span>
                                </div>
                                <span className={styles.plus_point}>기록 확인 중...</span>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </section>
        </div>
    )
}
export default UserProfile;