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

    public int loginMember(Member member) {
        // 1. 아이디로 회원 정보 가져오기
        Member dbMember = memberDao.loginMember(member.getMemberId());

        if (dbMember != null) {
            // [테스트 로그] 공백 확인을 위해 대괄호로 감싸서 출력해보세요
            System.out.println("입력비번: [" + member.getMemberPw() + "]");
            System.out.println("### 진짜 암호문: " + passwordEncoder.encode("Green1234!"));

            // 🌟 핵심: DB에서 가져온 암호화된 비밀번호의 모든 공백을 제거합니다.
            String trimmedDbPw = dbMember.getMemberPw().trim();
            System.out.println("DB비번: [" + trimmedDbPw + "]");

            // 2. matches 함수로 비교 (반드시 trim된 값을 넣어야 합니다)
            if (passwordEncoder.matches(member.getMemberPw(), trimmedDbPw)) {
                return 1; // ✨ 드디어 성공!
            } else {
                System.out.println("비밀번호가 일치하지 않습니다.");
            }
        } else {
            System.out.println("해당 아이디의 회원이 없습니다.");
        }
        return 0;
    }
}




