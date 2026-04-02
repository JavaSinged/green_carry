package kr.co.iei.cs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.iei.cs.model.service.CSService;
import kr.co.iei.cs.model.vo.Faq;


@RestController
@RequestMapping("/cs/inquiries")
@CrossOrigin(value="*")
public class CSController {
	
	@Autowired
	private CSService csService;
	
	//전체조회
	@GetMapping(value="/faq")
	public ResponseEntity<?> selectAllList(@RequestParam(value="faq_category") int faqCategory){
		List<Faq> list = csService.selectAllList(faqCategory);
		return ResponseEntity.ok(list);
	}

}
