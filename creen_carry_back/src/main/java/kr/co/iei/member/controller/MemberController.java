package kr.co.iei.member.controller;


import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.utils.JwtUtil;
import kr.co.iei.member.model.service.MemberService;

@RestController
@RequestMapping("/api/member")
@CrossOrigin(value="*") // 리액트 접근 허용
public class MemberController {

	@Autowired
    private MemberService memberService;

    @Autowired
    private JwtUtil jwtUtil; // ✨ JwtUtil 주입

    //1.로그인기능
    @PostMapping("/login")
    public ResponseEntity<?> loginMember(@RequestBody Member member) {
        System.out.println("로그인 요청 데이터: " + member);
        
        Member loginMember = memberService.loginMember(member);
        System.out.println("로그인 결과 데이터: " + loginMember);

        if (loginMember != null) {
            // 🌟 1. 액세스 토큰 생성 (ID와 등급 정보를 담음)
            String accessToken = jwtUtil.createToken(
                loginMember.getMemberId(), 
                loginMember.getMemberGrade()
            );

            // 🌟 2. 응답 데이터 구성 (Member 객체 + AccessToken)
            Map<String, Object> response = new HashMap<>();
            response.put("member", loginMember);
            response.put("accessToken", accessToken);

            // 성공 시 200 OK와 함께 데이터 전송
            return ResponseEntity.ok(response);
        } else {
            // 실패 시 401 Unauthorized 전송
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
 // 2. 아이디 찾기 (이름 + 이메일)
    @PostMapping("/findId")
    public ResponseEntity<?> findId(@RequestBody Member member) {
        // DB에서 이름과 이메일이 일치하는 사용자의 ID를 가져옴
        String memberId = memberService.findId(member);
        
        if (memberId != null) {
            return ResponseEntity.ok(memberId);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("일치하는 회원이 없습니다.");
        }
    }
    //비밀번호 재설정 1차 인증
    @PostMapping("/checkMember")
    public ResponseEntity<?> checkMember(@RequestBody Member member) {
        // 아이디와 이메일이 일치하는 행이 있는지 COUNT 조회
        int result = memberService.checkMember(member);
        return ResponseEntity.ok(result);
    }

    // 3. 비밀번호 재설정 (아이디 + 새 비밀번호)
    @PostMapping("/resetPw")
    public ResponseEntity<?> resetPw(@RequestBody Member member) {
        // 서비스에서 암호화 후 업데이트 진행
        int result = memberService.resetPw(member);
        
        if (result > 0) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("변경 실패");
        }
    }
    
    @PostMapping("/sendAuthCode")
    public ResponseEntity<?> sendAuthCode(@RequestBody Member member) {
        // 🌟 실제 메일 발송 실행
        String authCode = memberService.sendAuthCode(member.getMemberEmail());
        
        // 보안상 실제로는 authCode를 리턴하지 않고 서버 세션/Redis에 저장하지만,
        // 현재 테스트 환경에 맞춰 발송 성공 메시지만 보냅니다.
        return ResponseEntity.ok(authCode);
    }
    
    @PostMapping("/verifyCode")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> data) {
        String email = data.get("memberEmail");
        String inputCode = data.get("inputCode");
        System.out.println("프론트에서 온 이메일: " + email);
        System.out.println("프론트에서 온 입력코드: " + inputCode);
        
        // 서비스에서 저장된 인증번호와 비교 (이 예시에서는 간단히 서비스의 맵에서 확인)
        boolean isMatch = memberService.checkAuthCode(email, inputCode);
        
        return ResponseEntity.ok(isMatch);
    }
    
}
