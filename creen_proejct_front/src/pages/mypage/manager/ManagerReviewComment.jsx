import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../utils/accessToken";
import styles from "./ManagerReviewComment.module.css";
import axios from "axios";

const ManagerReviewComment = () => {
  const [reviews, setReviews] = useState([]);

  // 🌟 여러 리뷰의 답글 입력창 상태를 orderId별로 따로 관리하는 객체
  const [replyInputs, setReplyInputs] = useState({});

  // localStorage에서 사장님 정보 가져오기 (환경에 맞게 수정하세요)
  const storeId = localStorage.getItem("storeId");
  const memberId = localStorage.getItem("memberId");

  // 1. 가게 리뷰 목록 불러오기
  const fetchReviews = async () => {
    try {
      const backHost = import.meta.env.VITE_BACKSERVER;
      console.log(
        `🚀 백엔드로 요청 보냄: ${backHost}/stores/reviews/${storeId}`,
      );

      // api(인터셉터) 대신 axios로 주소를 확실하게 명시해서 찔러봅니다.
      const res = await axios.get(`${backHost}/stores/reviews/${storeId}`);

      console.log("✅ 백엔드에서 받아온 데이터:", res.data);
      setReviews(res.data ?? []);
    } catch (err) {
      console.error("❌ 리뷰 목록 로드 실패!");
      console.dir(err); // 에러의 진짜 이유를 콘솔에 다 까서 보여줍니다.
    }
  };

  useEffect(() => {
    console.log("🚀 현재 로컬스토리지의 storeId:", storeId);

    if (storeId) fetchReviews();
  }, [storeId]);

  // 2. 답글 입력창 변경 핸들러
  const handleInputChange = (orderId, text) => {
    setReplyInputs((prev) => ({ ...prev, [orderId]: text }));
  };

  // 3. 답글 등록 처리
  const submitReply = async (orderId) => {
    const content = replyInputs[orderId];

    if (!content || content.trim().length < 5) {
      return Swal.fire("알림", "답글을 5자 이상 작성해주세요.", "warning");
    }

    try {
      // 🌟 사진이 없으므로 깔끔하게 JSON 객체로 전송!
      const payload = {
        orderId: Number(orderId),
        storeId: Number(storeId),
        memberId: memberId,
        reviewCommentContent: content,
      };

      const res = await api.post("/stores/review/comment", payload);

      if (res.data === "SUCCESS") {
        Swal.fire("성공", "사장님 답글이 등록되었습니다! 🌱", "success");
        // 입력창 비우고 리뷰 목록 최신화
        setReplyInputs((prev) => ({ ...prev, [orderId]: "" }));
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("실패", "답글 등록 중 서버 오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>고객 리뷰 관리 📝</h2>
      <p className={styles.pageDesc}>
        고객님의 소중한 리뷰에 따뜻한 답글을 남겨주세요.
      </p>

      <div className={styles.reviewList}>
        {reviews.length === 0 ? (
          <p className={styles.noData}>아직 등록된 리뷰가 없습니다.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.orderId} className={styles.reviewCard}>
              {/* 🧑‍🦱 고객 리뷰 영역 */}
              <div className={styles.customerSection}>
                <div className={styles.reviewHeader}>
                  <div className={styles.stars}>
                    {"★".repeat(review.reviewRating)}
                    {"☆".repeat(5 - review.reviewRating)}
                  </div>
                  <span className={styles.date}>{review.reviewDate}</span>
                </div>

                <p className={styles.menuName}>주문 메뉴: {review.menuName}</p>
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
                      e.target.src = "/img/no-image.png"; // 이미지가 깨질 경우 기본 이미지 노출
                    }}
                  />
                )}
              </div>

              {/* 👨‍🍳 사장님 답글 영역 */}
              <div className={styles.bossSection}>
                {review.reviewCommentContent ? (
                  // ✅ 답글이 이미 등록된 경우
                  <div className={styles.replyCompleted}>
                    <p className={styles.bossTitle}>↳ 사장님 답글</p>
                    <p className={styles.replyContent}>
                      {review.reviewCommentContent}
                    </p>
                    <span className={styles.replyDate}>
                      {review.reviewCommentDate}
                    </span>
                  </div>
                ) : (
                  // ✏️ 답글이 없는 경우 (입력창 렌더링)
                  <div className={styles.replyForm}>
                    <p className={styles.bossTitle}>↳ 답글 작성</p>
                    <div className={styles.inputWrap}>
                      <textarea
                        className={styles.textarea}
                        placeholder="고객님께 감사 인사를 남겨보세요. (최소 5자)"
                        value={replyInputs[review.orderId] || ""}
                        onChange={(e) =>
                          handleInputChange(review.orderId, e.target.value)
                        }
                      />
                      <button
                        className={styles.submitBtn}
                        onClick={() => submitReply(review.orderId)}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerReviewComment;
