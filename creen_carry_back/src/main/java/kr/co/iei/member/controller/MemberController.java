package kr.co.iei.member.controller;


import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.utils.JwtUtil;
import kr.co.iei.member.model.service.MemberService;

@RestController
@RequestMapping("/member")
@CrossOrigin(value="*") // 리액트 접근 허용
public class MemberController {

    private final BCryptPasswordEncoder passwordEncoder;

	@Autowired
    private MemberService memberService;

    @Autowired
    private JwtUtil jwtUtil;

    MemberController(BCryptPasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    } // ✨ JwtUtil 주입

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
    	System.out.println("넘어온 아이디: " + member.getMemberId()); // 👈 이거 꼭 확인!
        System.out.println("넘어온 비번: " + member.getMemberPw());
        // 서비스에서 암호화 후 업데이트 진행
        int result = memberService.resetPw(member);
        
        if (result == -1) {
            // 🌟 기존 비밀번호와 동일할 경우 프론트엔드로 반환
            return ResponseEntity.ok(-1);
        } else if (result > 0) {
            // 성공 시
            return ResponseEntity.ok(result);
        } else {
            // 실패 시
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
        
        // 서비스에서 저장된 인증번호와 비교 
        boolean isMatch = memberService.checkAuthCode(email, inputCode);
        
        return ResponseEntity.ok(isMatch);
    }
    
    @GetMapping("/getMemberInfo")
    public ResponseEntity<?> getMemberInfo(@RequestParam String memberId) {
        // 🌟 이미 만들어둔 selectOneMember를 서비스에서 호출
    	System.out.println("현재 정보를 조회할 회원의 아이디 : " + memberId);
        Member member = memberService.selectOneMember(memberId);
        
        if (member != null) {
            // 보안상 비밀번호는 제거하고 보낼 수도 있습니다.
            return ResponseEntity.ok(member);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보 없음");
        }
    }
    @PostMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> data) {
        // 프론트에서 보낸 데이터 추출
        String memberId = data.get("memberId"); 
        String currentPw = data.get("currentPw");
        String newPw = data.get("newPw");

        // 서비스 호출 (결과에 따라 메시지 반환)
        try {
            boolean result = memberService.updatePassword(memberId, currentPw, newPw);
            if (result) {
                return ResponseEntity.ok("SUCCESS");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비밀번호 변경 실패");
            }
        } catch (IllegalArgumentException e) {
            // 현재 비밀번호가 틀린 경우 서비스에서 던진 메시지 처리
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    
    }
}
