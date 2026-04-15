import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./StoreReviewPage.module.css";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function StoreReviewPage() {
  const { id } = useParams(); // 🌟 주소창의 번호를 읽어옴
  const storeId = Number(id);
  const backHost = import.meta.env.VITE_BACKSERVER;
  //const location = useLocation();
  const navigate = useNavigate();
  //const storeId = location.state?.storeId;

  const [reviews, setReviews] = useState([]);
  const [storeName, setStoreName] = useState("");

  // 🌟 [추가] 페이지네이션을 위한 상태
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 7; // 10개씩 보기

  useEffect(() => {
    if (!storeId) {
      navigate(-1);
      return;
    }

    axios
      .get(`${backHost}/stores/${storeId}`)
      .then((res) => setStoreName(res.data.storeName));

    axios
      .get(`${backHost}/stores/reviews/${storeId}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("리뷰 로드 실패", err));
  }, [storeId, backHost, navigate]);

  // 🌟 [추가] 현재 페이지에 보여줄 리뷰 계산
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // 🌟 [추가] 총 페이지 수 계산
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // 🌟 [추가] 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // 페이지 이동 시 상단으로 부드럽게
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ArrowBackIcon
          onClick={() => navigate(-1)}
          className={styles.back_btn}
        />
        <h2>
          {storeName} 리뷰 ({reviews.length})
        </h2>
      </div>

      <div className={styles.review_list}>
        {/* 🌟 reviews 대신 currentReviews를 사용합니다. */}
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div key={review.orderId} className={styles.review_card}>
              <div className={styles.card_top}>
                <div className={styles.user_info}>
                  <div className={styles.avatar}>
                    <img
                      src={
                        review.memberProfile
                          ? `${review.memberProfile}`
                          : "/image/default-user.png"
                      }
                      alt="u"
                    />
                  </div>
                  <div className={styles.user_text}>
                    <span className={styles.user_id}>{review.memberId}</span>
                    <span className={styles.date}>{review.reviewDate}</span>
                  </div>
                </div>
                <div className={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={
                        i < review.reviewRating
                          ? styles.star_active
                          : styles.star_inactive
                      }
                    />
                  ))}
                </div>
              </div>

              <div className={styles.card_body}>
                <p className={styles.menu_name}>
                  🍴 주문메뉴: {review.menuName}
                </p>
                <div className={styles.content_wrap}>
                  <img
                    src={review.reviewThumb || "/image/no-image.png"}
                    className={styles.review_img}
                    alt="리뷰 이미지"
                  />

                  <p className={styles.text}>{review.reviewContent}</p>
                </div>
              </div>

              {review.reviewCommentContent && (
                <div className={styles.reply_box}>
                  <p className={styles.reply_owner}>👨‍🍳 사장님 답글</p>
                  <p className={styles.reply_text}>
                    {review.reviewCommentContent}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.empty}>아직 작성된 리뷰가 없습니다. 🌱</div>
        )}
      </div>

      {/* 🌟 [추가] 페이지네이션 UI */}
      {reviews.length > reviewsPerPage && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.page_btn}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`${styles.page_number} ${currentPage === i + 1 ? styles.active : ""}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.page_btn}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
