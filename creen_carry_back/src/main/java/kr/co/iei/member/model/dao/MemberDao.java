package kr.co.iei.member.model.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.member.model.vo.Member;

@Mapper
public interface MemberDao {


	Member loginMember(Member member);

	String findId(Member member);

	int resetPassword(Member member);

	int checkMember(Member member);

	Member selectOneMember(String memberId);

}