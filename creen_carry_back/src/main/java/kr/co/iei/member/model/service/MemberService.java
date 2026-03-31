package kr.co.iei.member.model.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import kr.co.iei.member.model.dao.MemberDao;

import kr.co.iei.member.model.vo.Member;


@Service
public class MemberService {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private MemberDao memberDao;

    public Member loginMember(Member member) {
        // 1. 아이디 + 등급으로 DB 조회
        Member dbMember = memberDao.loginMember(member);

        if (dbMember != null) {
            // 2. 비밀번호 비교 (공백 제거 필수!)
            String dbPw = dbMember.getMemberPw().trim();
            
            if (passwordEncoder.matches(member.getMemberPw(), dbPw)) {
                // ✨ 로그인 성공 시: 비번은 보안상 비우고 객체 자체를 리턴
                dbMember.setMemberPw(null); 
                return dbMember; 
            } else {
                System.out.println("비밀번호 불일치");
            }
        } else {
            System.out.println("회원 정보 없음 (ID 또는 Grade 불일치)");
        }
        
        // ✨ 로그인 실패 시: null 리턴
        return null;
    }

	public int insertManager(Member member) {
		String memberPw = member.getMemberPw();
		System.out.println(memberPw);
		String encPw=passwordEncoder.encode(memberPw);
		System.out.println(encPw);
		member.setMemberPw(encPw);
		int result = memberDao.insertManager(member);
		System.out.println(member);
		
		return 0;
	}

	public Member storeDupCheck(int storeOwnerNo) {
		Member member = memberDao.storeDupCheck(storeOwnerNo);
		return member;
	}
    //user 아이디 중복체크
	public Member selectOneMember(String memberId) {
		Member member = memberDao.selectOneMember(memberId);
		return member;
	}

	public int insertUser(Member member) {
		int result = memberDao.insertUser(member);
		return result;
	}
}




