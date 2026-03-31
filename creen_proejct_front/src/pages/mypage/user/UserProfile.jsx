import { useEffect, useState } from "react";
import styles from "./UserProfile.module.css";
import Diversity1Icon from '@mui/icons-material/Diversity1';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StorefrontIcon from '@mui/icons-material/Storefront'; // 가게 아이콘
import Collapse from '@mui/material/Collapse';

const UserProfile = () => {
    const carbonSt = {
        title: "커뮤니티가 절약한 탄소",
        value: "9,999",
        unit: "kg",
        subText: "CO2"
    };
    const myCarbonSt = {
        title: "나의 탄소 절감량",
        value: "9,999",
        unit: "kg",
        subText: "이번 달 절감량"
    };
    const FromLastMonth = {
        title: "지난 달 대비",
        value: "+23",
        unit: "%",
        subText: "증가"
    };

    const [point, setPoint] = useState(10000);
    const [openEco, setOpenEco] = useState(false);
    const [openHistory, setOpenHistory] = useState(false);
    const [progress, setProgress] = useState(0);

    const toggleEco = () => setOpenEco(!openEco);
    const toggleHistory = () => setOpenHistory(!openHistory);

    /* [ 게이지 바 계산 로직 안내 ]
       1. 현재 탄소 절감량 (current)과 목표량 (target)을 정의합니다.
       2. 공식: (현재량 / 목표량) * 100 = 퍼센트(%)
       3. Math.min(값, 100): 계산된 값이 100을 넘더라도 게이지가 뚫고 나가지 않게 최대치를 100으로 고정합니다.
    */
    useEffect(() => {
        const targetPercent = 75;

        const timer = setTimeout(() => {
            setProgress(targetPercent);
        }, 100);

        return () => clearTimeout(timer);
    }, []);
    return (
        <div className={styles.right}>
            {/* 상단 3개 통계 박스 */}
            <section className={styles.right_main}>
                <div className={styles.icon_content}>
                    <div className={styles.icon}><Diversity1Icon /></div>
                    <div className={styles.dashboard}>
                        <p className={styles.dashboard_title}>{carbonSt.title}</p>
                        <p className={styles.dashboard_value}>{carbonSt.value}{carbonSt.unit}</p>
                        <p className={styles.dashbboard_subtitle}>{carbonSt.subText}</p>
                    </div>
                </div>
                <div className={styles.icon_content}>
                    <div className={styles.icon}><EnergySavingsLeafIcon /></div>
                    <div className={styles.dashboard}>
                        <p className={styles.dashboard_title}>{myCarbonSt.title}</p>
                        <p className={styles.dashboard_value}>{myCarbonSt.value}{myCarbonSt.unit}</p>
                        <p className={styles.dashbboard_subtitle}>{myCarbonSt.subText}</p>
                    </div>
                </div>
                <div className={styles.icon_content}>
                    <div className={styles.icon}><TrendingUpIcon /></div>
                    <div className={styles.dashboard}>
                        <p className={styles.dashboard_title}>{FromLastMonth.title}</p>
                        <p className={styles.dashboard_value}>{FromLastMonth.value}{FromLastMonth.unit}</p>
                        <p className={styles.dashbboard_subtitle}>{FromLastMonth.subText}</p>
                    </div>
                </div>
                <div className={styles.gauge_container}>
                    <div className={styles.gauge_bg}>
                        {/* 게이지 채워지는 비율 (style width로 조절) */}
                        <div className={styles.gauge_fill} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className={styles.gauge_info}>
                        <span>🌳 나무 10 그루 상당</span>
                    </div>
                </div>
            </section>

            {/* 하단 에코 포인트 영역 */}
            <section className={styles.right_sub}>
                <div className={styles.my_point}>
                    <span>에코 포인트</span>
                    <p>보유 포인트 : {point.toLocaleString()}P</p>
                </div>

                {/* 1. 에코 포인트란? (Collapse 적용) */}
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

                {/* 2. 적립 내역 (Collapse 적용) */}
                <div className={styles.collapse_wrapper}>
                    <div className={styles.collapse_header} onClick={toggleHistory}>
                        <p>적립 내역 <span className={styles.history_sub}>최근 3개월 적립 내역</span></p>
                        <div className={styles.hs_icon}>
                            {openHistory ? <KeyboardArrowDownIcon /> : <ArrowForwardIosIcon />}
                        </div>
                    </div>
                    <Collapse in={openHistory} timeout="auto" unmountOnExit>
                        <div className={styles.history_list}>
                            {/* 리스트 아이템 1 */}
                            <div className={styles.history_item}>
                                <div className={styles.history_left}>
                                    <StorefrontIcon className={styles.store_icon} />
                                    <span>핵밥 : 핵밥 정식</span>
                                </div>
                                <span className={styles.plus_point}>+ 20P</span>
                            </div>
                            {/* 리스트 아이템 2 */}
                            <div className={styles.history_item}>
                                <div className={styles.history_left}>
                                    <StorefrontIcon className={styles.store_icon} />
                                    <span>핵밥 : 핵밥 정식</span>
                                    <span className={styles.history_date}>2026 - 01 - 03</span>
                                </div>
                                <span className={styles.plus_point}>+ 20P</span>
                            </div>
                            {/* 리스트 아이템 3 */}
                            <div className={styles.history_item}>
                                <div className={styles.history_left}>
                                    <StorefrontIcon className={styles.store_icon} />
                                    <span>핵밥 : 핵밥 정식</span>
                                    <span className={styles.history_date}>2026 - 01 - 03</span>
                                </div>
                                <span className={styles.plus_point}>+ 20P</span>
                            </div>
                            {/* 리스트 아이템 4 */}
                            <div className={styles.history_item}>
                                <div className={styles.history_left}>
                                    <StorefrontIcon className={styles.store_icon} />
                                    <span>핵밥 : 핵밥 정식</span>
                                    <span className={styles.history_date}>2026 - 01 - 03</span>
                                </div>
                                <span className={styles.plus_point}>+ 20P</span>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </section>
        </div>
    )
}
export default UserProfile;