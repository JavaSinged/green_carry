package kr.co.iei.cs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.cs.model.service.CSService;
import kr.co.iei.cs.model.vo.Faq;
import kr.co.iei.cs.model.vo.Qna;
import tools.jackson.databind.ext.QNameSerializer;


@RestController
@RequestMapping("/cs/inquiries")
@CrossOrigin(value="*")
public class CSController {
	
	@Autowired
	private CSService csService;
	
	//전체조회
	@GetMapping(value="/faq")
	public ResponseEntity<?> selectAllList(Faq faq){
		System.out.println("데이터 확인:" +faq);
		List<Faq> list = csService.selectAllList(faq);
		return ResponseEntity.ok(list);
		

	}
	
	//1:1문의내역 전체조회
	@GetMapping(value="/list")
	public ResponseEntity<?> selectMyInquiry(@RequestParam("memberId") String memberId){
		List<Qna> list =   csService.selectMyInquiry(memberId);
		return ResponseEntity.ok(list);
	}
	
	//문의등록
	@PostMapping(value="/submit")
	public ResponseEntity<?> insertQna(@RequestBody Qna qna){
		int result = csService.insertQna(qna);
		return ResponseEntity.ok(result);
	}

	//문의삭제
	@DeleteMapping(value="/delete")
	public ResponseEntity<?> deleteInquiry(@RequestParam Integer qnaNo){
		int result = csService.deleteInquiry(qnaNo);
		return ResponseEntity.ok(result);
	}
	
	//문의수정
	@PutMapping(value="/update")
	public ResponseEntity<?> putInquiry(@RequestBody Qna qna){
		int result = csService.putInquiry(qna);
		return ResponseEntity.ok(result);
				
	}
	
	
}
