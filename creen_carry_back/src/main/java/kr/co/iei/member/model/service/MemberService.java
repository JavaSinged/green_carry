package kr.co.iei.member.model.service;


import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.iei.member.model.dao.MemberDao;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.utils.EmailSender;


@Service
public class MemberService {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private MemberDao memberDao;
    
    @Autowired
    private EmailSender emailSender;

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
	
    // 이메일 인증번호 저장을 위한 간단한 맵 (실무에선 Redis 추천)
    private Map<String, String> authCodeMap = new HashMap<>();

    public String sendAuthCode(String email) {
        // 1. 6자리 랜덤 인증번호 생성
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<6; i++) {
            sb.append(r.nextInt(10));
        }
        String authCode = sb.toString();
        authCodeMap.put(email, authCode);

        // 2. 이메일 내용 작성
        String title = "[GreenCarry] 계정 확인을 위한 인증번호입니다.";
        String content = "<h1>안녕하세요, GreenCarry입니다.</h1>"
                       + "<p>요청하신 인증번호는 <b>" + authCode + "</b> 입니다.</p>"
                       + "<p>인증번호를 입력창에 정확히 기입해주세요.</p>";

        // 3. 메일 발송
        emailSender.sendMail(title, email, content);
        
        System.out.println("인증번호 :" + authCode);
        return authCode; // 테스트를 위해 리턴하거나 메모리에 저장
    }
 // 🌟 [추가] 컨트롤러에서 호출하는 검증 메서드 구현
    public boolean checkAuthCode(String email, String inputCode) {
        // 1. 해당 이메일로 발송된 번호가 있는지 확인
        String savedCode = authCodeMap.get(email);
        System.out.println("메모리에 저장된 코드: " + savedCode);
        
        // 2. 저장된 번호가 있고, 사용자가 입력한 번호와 일치하면 true 반환
        if (savedCode != null && savedCode.equals(inputCode)) {
            // 인증 성공 시 보안을 위해 맵에서 삭제 (1회용)
            authCodeMap.remove(email); 
            return true;
        }
        
        return false;
    }
}





