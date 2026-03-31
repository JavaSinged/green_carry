package kr.co.iei.member.controller;


import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.utils.EmailSender;
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
    
  	@Autowired
  	private EmailSender sender;

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
    @PostMapping("/signupManager")
    public ResponseEntity<?> signupManager(@RequestBody Member member){
    	int result = memberService.insertManager(member);
    	return ResponseEntity.ok(result);
    }
    @GetMapping("/storeDupCheck")
    public ResponseEntity<?> storeDupCheck(@RequestParam int storeOwnerNo){
    	Member member = memberService.storeDupCheck(storeOwnerNo);
    	return ResponseEntity.ok(member);
    }
    
    //user아이디 중복체크
    @GetMapping(value="/exists")
    public ResponseEntity<?> handleIdCheck(@RequestParam String memberId){
    	Member member = memberService.selectOneMember(memberId);
    	return ResponseEntity.ok(member == null);
    }
    
  //메일전송요청
    @PostMapping(value="/email-verification")
    public ResponseEntity<?> sendMail(@RequestBody Member m){
       String emailTitle = "Greencarry 회원가입 인증메일";
       Random r = new Random();
       StringBuffer sb = new StringBuffer();
       for(int i=0; i<6; i++) {
          //숫자 6자리랜덤
          sb.append(r.nextInt(10));
       }
       String authCode = sb.toString();
       String emailContent = "<h1>안녕하세요 Greencarry입니다.</h1>"
             +"<h3>인증번호는 </h3>"
             +"[<b>"+authCode+"</b>] 입니다.";
       sender.sendMail(emailTitle, m.getMemberEmail(), emailContent);

       return ResponseEntity.ok(authCode); //React로 인증번호를 보내는 것
    }
    
    //user회원가입
    @PostMapping(value="/userSignup")
    public ResponseEntity<?> userSignup(@RequestBody Member member){
    	int result = memberService.insertUser(member);
    	return ResponseEntity.ok(result);
    }

    
    
}
