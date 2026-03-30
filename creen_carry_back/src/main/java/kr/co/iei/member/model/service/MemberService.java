package kr.co.iei.member.model.service;


import java.util.HashMap;
import java.util.Map;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.member.model.dao.MemberDao;

import kr.co.iei.member.model.vo.Member;


@Service
public class MemberService {

    @Autowired
    private MemberDao memberDao;

	public int loginMember(Member member) {
		int result = memberDao.loginMember(member);
		return result;
	}


}

