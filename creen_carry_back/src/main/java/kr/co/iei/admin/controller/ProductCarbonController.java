package kr.co.iei.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import kr.co.iei.admin.model.service.ProductCarbonService;
import kr.co.iei.admin.model.vo.ProductCarbon;
import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequestMapping("/carbon-list")
@RequiredArgsConstructor
public class ProductCarbonController {

	private final ProductCarbonService productCarbonService;

	@GetMapping
	public ResponseEntity<?> getCarbonList() {

		List<ProductCarbon> list = productCarbonService.getCarbonList();
		System.out.println(list);
		return ResponseEntity.ok(list);
	}

	@DeleteMapping("/{productId}")
	public ResponseEntity<?> deleteContainer(@PathVariable Integer productId) {
		int result = productCarbonService.deleteCarbon(productId);
	    
	    if(result > 0) {
	        return ResponseEntity.ok("SUCCESS"); // 성공하면 리액트로 SUCCESS 보냄
	    } else {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FAIL");
	    }
	}	
	@PostMapping("/update")
	public ResponseEntity<?> updateCarbon(
		@ModelAttribute ProductCarbon product,
		@RequestParam(value="uploadFile", required = false) MultipartFile uploadFile){
		
		//서비스 요청하기
		Integer result = productCarbonService.updateProduct(product, uploadFile);
		
		if(result > 0) {
			return ResponseEntity.ok("SUCCESS");
	}else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FAIL");
	}
	}
	// 값이 없으면 "0"을 보내도록 보정
}
