import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../utils/accessToken";
import styles from "../manager/ManagerReviewComment.module.css";
import axios from "axios";

const ManagerReviewComment = () => {
  const [reviews, setReviews] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  // 🌟 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 보여줄 리뷰 개수

  const storeId = localStorage.getItem("storeId");
  const memberId = localStorage.getItem("memberId");

  const fetchReviews = async () => {
    try {
      const backHost = import.meta.env.VITE_BACKSERVER;
      const res = await axios.get(`${backHost}/admin/reviews`);
      setReviews(res.data ?? []);
    } catch (err) {
      console.error("❌ 리뷰 목록 로드 실패!");
      console.dir(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 🌟 페이지 변경 시 최상단으로 부드럽게 스크롤 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // 🌟 현재 페이지에 해당하는 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const handleInputChange = (orderId, text) => {
    setReplyInputs((prev) => ({ ...prev, [orderId]: text }));
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>리뷰 관리 📝</h2>

      <div className={styles.reviewList}>
        {reviews.length === 0 ? (
          <p className={styles.noData}>아직 등록된 리뷰가 없습니다.</p>
        ) : (
          <>
            {/* 🌟 전체 리스트가 아닌 현재 페이지의 아이템(currentItems)만 출력 */}
            {currentItems.map((review) => (
              <div
                key={review.orderId}
                className={styles.reviewCard}
                style={{ position: "relative" }}
              >
                {/* 고객 리뷰 영역 */}
                <div className={styles.customerSection}>
                  <div className={styles.userInfo}>
                    <img
                      src={
                        review.memberProfile
                          ? `${import.meta.env.VITE_BACKSERVER}${review.memberProfile}`
                          : "/image/default-user.png"
                      }
                      alt="profile"
                      className={styles.userAvatar}
                    />
                    <div className={styles.userNameArea}>
                      <span className={styles.userName}>
                        {review.memberId} 고객님
                      </span>
                      <div className={styles.stars}>
                        {"★".repeat(review.reviewRating)}
                        {"☆".repeat(5 - review.reviewRating)}
                      </div>
                    </div>
                    <span className={styles.date}>{review.reviewDate}</span>
                  </div>

                  <p className={styles.menuName}>
                    주문 메뉴: {review.menuName}
                  </p>
                  <p className={styles.content}>{review.reviewContent}</p>

                  {review.reviewThumb && (
                    <img
                      src={
                        review.reviewThumb.startsWith("/")
                          ? `${import.meta.env.VITE_BACKSERVER}${review.reviewThumb}`
                          : `${import.meta.env.VITE_BACKSERVER}/uploads/review/${review.reviewThumb}`
                      }
                      alt="리뷰사진"
                      className={styles.reviewImg}
                      onError={(e) => {
                        e.target.src = "/img/no-image.png";
                      }}
                    />
                  )}
                </div>

                {/* 사장님 답글 영역 */}
                <div className={styles.bossSection}>
                  {review.reviewCommentContent && (
                    <div className={styles.replyCompleted}>
                      <p className={styles.bossTitle}>↳ 사장님 답글</p>
                      <p className={styles.replyContent}>
                        {review.reviewCommentContent}
                      </p>
                      <span className={styles.replyDate}>
                        {review.reviewCommentDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* ⬆️ 여기가 누락되어 있었습니다! (reviewCard div 닫기 & map 함수 닫기) */}

            {/* 🌟 페이지네이션 UI 추가 */}
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                &lt;
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ""}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerReviewComment;
