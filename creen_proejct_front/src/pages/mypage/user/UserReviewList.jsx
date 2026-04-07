import React, { useState, useEffect } from "react";
import api from "../../../utils/accessToken";
import styles from "./UserReviewList.module.css";
import Swal from "sweetalert2";

const UserReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const backHost = import.meta.env.VITE_BACKSERVER;

  const getMyReviews = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) return;

      const res = await api.get(`/member/myReviewList/${memberId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("리뷰 로드 실패:", err);
    }
  };

  useEffect(() => {
    getMyReviews();
  }, []);

  const deleteReview = (orderId) => {
    Swal.fire({
      title: "리뷰를 삭제하시겠습니까?",
      text: "삭제된 리뷰는 복구할 수 없으며 에코 포인트가 차감될 수 있습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#246337",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/member/deleteReview/${orderId}`);
          if (res.data === "SUCCESS") {
            Swal.fire(
              "삭제 성공",
              "리뷰가 정상적으로 삭제되었습니다.",
              "success",
            );
            getMyReviews();
          }
        } catch (err) {
          Swal.fire("에러", "리뷰 삭제 중 오류가 발생했습니다.", "error");
        }
      }
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (!review.reviewDate) return true;

    const reviewMonth = review.reviewDate.substring(0, 7);

    if (startDate && !endDate) return reviewMonth >= startDate;
    if (!startDate && endDate) return reviewMonth <= endDate;
    if (startDate && endDate)
      return reviewMonth >= startDate && reviewMonth <= endDate;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.filter_row}>
        <input
          type="month"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span>~</span>
        <input
          type="month"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className={styles.review_list}>
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.orderId} className={styles.review_card}>
              <div className={styles.card_header}>
                <div className={styles.store_info}>
                  <span className={styles.store_icon}>🏪</span>
                  <span className={styles.store_name}>{review.storeName}</span>
                  <span className={styles.menu_detail}>
                    🍴 {review.menuName}
                    {review.extraCount > 0 && ` 외 ${review.extraCount}개`} | 💰{" "}
                    {review.totalPrice?.toLocaleString() || 0}원
                  </span>
                  <span className={styles.order_date}>
                    <span className={styles.date_icon}>📅</span>
                    {review.reviewDate}
                  </span>
                </div>
                <button
                  className={styles.delete_btn}
                  onClick={() => deleteReview(review.orderId)}
                >
                  삭제
                </button>
              </div>

              <div className={styles.card_body}>
                <img
                  src={
                    review.reviewThumb
                      ? review.reviewThumb.startsWith("/")
                        ? `${backHost}${review.reviewThumb}`
                        : `${backHost}/uploads/review/${review.reviewThumb}`
                      : "/img/no-image.png"
                  }
                  alt="리뷰사진"
                  className={styles.review_img}
                  onError={(e) => {
                    e.target.src = "/img/no-image.png";
                  }}
                />

                <div className={styles.chat_area}>
                  <div className={styles.user_bubble}>
                    <div className={styles.user_top}>
                      <div className={styles.avatar}>
                        <img
                          src={
                            review.memberProfile
                              ? `${backHost}${review.memberProfile}`
                              : "/img/default-user.png"
                          }
                          alt="avatar"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <span className={styles.member_id}>
                        {review.memberId}
                      </span>

                      <span className={styles.star_rating}>
                        ⭐ {review.reviewRating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className={styles.bubble_content}>
                      {review.reviewContent}
                    </div>
                  </div>

                  {review.reviewCommentContent && (
                    <div className={styles.owner_bubble}>
                      <div className={styles.bubble_content}>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#2f8f46",
                            fontSize: "13px",
                            marginBottom: "4px",
                            display: "inline-block",
                          }}
                        >
                          ↳ 사장님 답글
                        </span>
                        <br />
                        {review.reviewCommentContent}
                        <span className={styles.reply_date}>
                          {review.reviewCommentDate}
                        </span>
                      </div>
                      <div className={styles.avatar_owner}>
                        <span style={{ fontSize: "30px" }}>👨‍🍳</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.no_data}>
            해당 기간에 작성한 리뷰가 없습니다. 🌱
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviewList;
