package kr.co.iei.member.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.vo.Review;

@Mapper
public interface MemberDao {


	Member loginMember(Member member);

	String findId(Member member);

	int resetPassword(Member member);

	int checkMember(Member member);

	Member selectOneMember(String memberId);

	int updatePassword(String memberId, String encodedNewPw);



	List<Member> selectAllMember();

	int updateProfile(Member member);

	int insertUser(Member member);

	int insertManager(Member member);

	Member storeDupCheck(String storeOwnerNo);

	Member emailDupCheck(String memberEmail);

	int updateAddress(Member member);


	void deleteMember(String memberId);

	int getTotalCarbonPoint(String memberId);

	int getCommunityTotalCarbon();

	int checkOrderOwner(@Param("orderId") int orderId, @Param("memberId") String memberId);

    int isAlreadyReviewed(int orderId);

    int insertReview(Review review);

	List<Review> selectReviewList(String memberId);

	int deleteReview(int orderId);

}