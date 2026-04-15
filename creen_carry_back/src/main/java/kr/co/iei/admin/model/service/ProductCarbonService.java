package kr.co.iei.admin.model.service;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import kr.co.iei.admin.model.dao.ProductCarbonDao;
import kr.co.iei.admin.model.vo.ProductCarbon;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCarbonService {

	private final ProductCarbonDao productCarbonDao;

	// 불러오기 로직
	public List<ProductCarbon> getCarbonList() {
		return productCarbonDao.selectAllCarbon();
	}

	// 용기 정보 저장
	@Transactional
	public Integer updateProduct(ProductCarbon product, MultipartFile uploadFile) {

		if (uploadFile != null && !uploadFile.isEmpty()) {
            
            String originalFileName = uploadFile.getOriginalFilename();
            
            String ext = originalFileName.substring(originalFileName.lastIndexOf("."));
            
            String saveFileName = java.util.UUID.randomUUID().toString() + ext;

            // 이미지 앞에 붙일 경로
            product.setProductImg("/uploads/container/" + saveFileName);

            // 실제 파일이 저장될 물리적 경로
            String savePath = "//192.168.31.26/project/upload/web/container/";
            
            try {
                // 폴더가 없으면 생성
                File folder = new File(savePath);
                if (!folder.exists()) {
                    folder.mkdirs();
                }
                
                // 실제 파일 저장
                uploadFile.transferTo(new File(savePath + saveFileName));
            } catch (IOException e) {
                e.printStackTrace();
                
                return 0; 
            }
        }

		if (product.getProductId() != null && product.getProductId() != 0) {
			// 수정
			return productCarbonDao.updateCarbonProduct(product, uploadFile);
		} else {
			// 등록
			return productCarbonDao.insertCarbonProduct(product, uploadFile);
		}
	}

	// 삭제
	public Integer deleteCarbon(Integer productId) {
		return productCarbonDao.deleteCarbon(productId);
	}
}
