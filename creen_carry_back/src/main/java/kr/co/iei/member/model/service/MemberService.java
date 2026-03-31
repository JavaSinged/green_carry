package kr.co.iei.member.model.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
 // 아이디 찾기 로직
    public String findId(Member member) {
        return memberDao.findId(member);
    }

    // 비밀번호 재설정 로직
    @Transactional // 수정 작업이므로 트랜잭션 처리
    public int resetPw(Member member) {
        // 🌟 핵심: 프론트에서 넘어온 새 비밀번호를 암호화합니다.
        String encodedPassword = passwordEncoder.encode(member.getMemberPw());
        member.setMemberPw(encodedPassword);
        
        return memberDao.resetPassword(member);
    }
	public int checkMember(Member member) {
		int result = memberDao.checkMember(member);
		return result;
	}

}




