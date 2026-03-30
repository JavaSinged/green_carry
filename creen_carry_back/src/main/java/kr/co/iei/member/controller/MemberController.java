package kr.co.iei.member.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.member.model.vo.Member;
import kr.co.iei.member.model.service.MemberService;

@RestController
@RequestMapping("/api/member")
@CrossOrigin(value="*") // 리액트(포트 3000) 접근 허용
public class MemberController {

    @Autowired
    private MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<?> loginMember(@RequestBody Member member){
    	System.out.println(member);
    	int result = memberService.loginMember(member);

        return ResponseEntity.ok(result);
    }
}
