package kr.co.iei.admin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteContainer(@PathVariable Integer productId) {
        int result = productCarbonService.deleteCarbon(productId);

        if (result > 0) {
            return ResponseEntity.ok("SUCCESS");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FAIL");
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateCarbon(
            @ModelAttribute ProductCarbon product,
            @RequestParam(value = "uploadFile", required = false) MultipartFile uploadFile) {

        Integer result = productCarbonService.updateProduct(product, uploadFile);

        if (result > 0) {
            return ResponseEntity.ok("SUCCESS");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("FAIL");
        }
    }
}
