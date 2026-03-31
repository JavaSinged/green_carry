package kr.co.iei.member.model.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.member.model.vo.Member;

@Mapper
public interface MemberDao {


	Member loginMember(Member member);

	int insertManager(Member member);

	Member storeDupCheck(int storeOwnerNo);

}